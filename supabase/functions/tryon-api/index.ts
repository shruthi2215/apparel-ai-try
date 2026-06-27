import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { runTryOn, fetchImageAsDataUrl, sha256Hex } from "../_shared/tryonPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Very small in-memory rate limiter (per key, per instance).
const RATE_WINDOW_MS = 60_000; // per minute
const buckets = new Map<string, { count: number; reset: number }>();

function rateLimited(keyId: string, limit: number): boolean {
  const now = Date.now();
  const b = buckets.get(keyId);
  if (!b || now > b.reset) {
    buckets.set(keyId, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  b.count++;
  return b.count > limit;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // ---- API key authentication ----
  const auth = req.headers.get("authorization") || "";
  const rawKey = req.headers.get("x-api-key") || (auth.startsWith("Bearer ") ? auth.slice(7) : "");
  if (!rawKey) {
    return json({ error: "Missing API key. Provide it in the 'x-api-key' header.", requestId, status: "failed" }, 401);
  }

  const keyHash = await sha256Hex(rawKey);
  const { data: keyRow } = await admin
    .from("api_keys")
    .select("id, merchant_id, revoked")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!keyRow || keyRow.revoked) {
    return json({ error: "Invalid or revoked API key.", requestId, status: "failed" }, 401);
  }

  const { data: merchant } = await admin
    .from("merchants")
    .select("id, status, rate_limit_per_min, monthly_quota")
    .eq("id", keyRow.merchant_id)
    .maybeSingle();

  if (!merchant) return json({ error: "Merchant not found.", requestId, status: "failed" }, 403);
  if (merchant.status !== "active") {
    return json({ error: `Merchant account is ${merchant.status}.`, requestId, status: "failed" }, 403);
  }

  // ---- Rate limiting (per merchant configured limit) ----
  const perMinLimit = merchant.rate_limit_per_min || 30;
  if (rateLimited(keyRow.id, perMinLimit)) {
    return json({ error: `Rate limit exceeded. Max ${perMinLimit} requests/min.`, requestId, status: "failed" }, 429);
  }

  // ---- Monthly quota enforcement ----
  if (merchant.monthly_quota && merchant.monthly_quota > 0) {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await admin
      .from("tryon_requests")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchant.id)
      .gte("created_at", monthStart.toISOString());
    if ((count ?? 0) >= merchant.monthly_quota) {
      return json({ error: "Monthly quota exceeded. Upgrade your plan to continue.", requestId, status: "failed" }, 429);
    }
  }

  // touch last_used_at (best effort)
  admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id).then(() => {});

  // ---- Parse body ----
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body.", requestId, status: "failed" }, 400);
  }

  const {
    userImage, // base64 or data URL (required)
    productImage, // image URL or data URL (required)
    productId,
    productName = "Garment",
    productCategory,
    selectedColor,
    sessionId,
  } = body || {};

  if (!userImage || !productImage) {
    return json({ error: "Both 'userImage' and 'productImage' are required.", requestId, status: "failed" }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI not configured.", requestId, status: "failed" }, 500);

  const userImageDataUrl = String(userImage).startsWith("data:")
    ? String(userImage)
    : `data:image/jpeg;base64,${userImage}`;

  const productImageDataUrl = String(productImage).startsWith("data:")
    ? String(productImage)
    : await fetchImageAsDataUrl(String(productImage));

  async function log(status: string, errorCode?: string) {
    await admin.from("tryon_requests").insert({
      merchant_id: merchant.id,
      request_id: requestId,
      product_id: productId ? String(productId) : null,
      product_name: productName,
      status,
      latency_ms: Date.now() - startedAt,
      error_code: errorCode ?? null,
    });
  }

  try {
    const result = await runTryOn({
      apiKey: LOVABLE_API_KEY,
      userImageDataUrl,
      productImageDataUrl,
      productName,
      productCategory,
      selectedColor,
    });

    if (result.status === 200 && result.imageUrl) {
      await log("success");
      return json({
        status: "success",
        requestId,
        sessionId: sessionId ?? null,
        imageUrl: result.imageUrl,
        processingTimeMs: Date.now() - startedAt,
      }, 200);
    }

    await log("failed", result.validationFailed ? "validation_failed" : "ai_error");
    return json({
      status: "failed",
      requestId,
      error: result.error || "Generation failed",
      validationFailed: result.validationFailed || false,
    }, result.status === 200 ? 422 : result.status);
  } catch (err) {
    await log("failed", "exception");
    return json({ status: "failed", requestId, error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});