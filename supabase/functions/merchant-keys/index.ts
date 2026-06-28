import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { sha256Hex } from "../_shared/tryonPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function generateKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 32);
  return `tk_live_${b64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Identify the calling user from their JWT.
  const authHeader = req.headers.get("authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Not authenticated" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const { action, merchantId, name, keyId } = body || {};

  // Verify the user owns this merchant (or is super admin).
  const { data: merchant } = await admin
    .from("merchants")
    .select("id, owner_user_id, status, plan_id")
    .eq("id", merchantId)
    .maybeSingle();
  if (!merchant) return json({ error: "Merchant not found" }, 404);

  const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
  const isSuperAdmin = (roleRows ?? []).some((r: any) => r.role === "super_admin");
  if (merchant.owner_user_id !== user.id && !isSuperAdmin) {
    return json({ error: "Forbidden" }, 403);
  }

  // API keys expire based on the merchant's purchased plan duration (period_days).
  async function computeExpiry(): Promise<string> {
    let periodDays = 30;
    if (merchant.plan_id) {
      const { data: plan } = await admin
        .from("subscription_plans").select("period_days").eq("id", merchant.plan_id).maybeSingle();
      if (plan?.period_days) periodDays = plan.period_days;
    }
    return new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();
  }

  async function audit(action: string, targetId: string | null, metadata: Record<string, unknown> = {}) {
    await admin.from("audit_logs").insert({
      actor_user_id: user.id,
      actor_email: user.email,
      merchant_id: merchantId,
      action,
      target_type: "api_key",
      target_id: targetId,
      metadata,
    });
  }

  async function mintKey(label: string) {
    const rawKey = generateKey();
    const keyHash = await sha256Hex(rawKey);
    const keyPrefix = rawKey.slice(0, 12);
    const expiresAt = await computeExpiry();
    const { data, error } = await admin
      .from("api_keys")
      .insert({ merchant_id: merchantId, name: label, key_prefix: keyPrefix, key_hash: keyHash, expires_at: expiresAt })
      .select("id, name, key_prefix, created_at, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return { ...data, key: rawKey };
  }

  // API keys can only be issued once a merchant is approved (active).
  const requiresActive = action === "create" || action === "rotate";
  if (requiresActive && merchant.status !== "active") {
    return json({ error: `Merchant must be approved before API keys can be issued (status: ${merchant.status}).` }, 403);
  }

  if (action === "create") {
    const rawKey = generateKey();
    const keyHash = await sha256Hex(rawKey);
    const keyPrefix = rawKey.slice(0, 12);
    const expiresAt = await computeExpiry();
    const { data, error } = await admin
      .from("api_keys")
      .insert({ merchant_id: merchantId, name: name || "Default key", key_prefix: keyPrefix, key_hash: keyHash, expires_at: expiresAt })
      .select("id, name, key_prefix, created_at, expires_at")
      .single();
    if (error) return json({ error: error.message }, 400);
    await audit("api_key.created", data.id, { name: data.name, expires_at: data.expires_at });
    // Return the raw key ONCE — it is never stored or retrievable again.
    return json({ ...data, key: rawKey }, 200);
  }

  if (action === "rotate") {
    if (!keyId) return json({ error: "keyId required" }, 400);
    const { data: old } = await admin
      .from("api_keys").select("id, name").eq("id", keyId).eq("merchant_id", merchantId).maybeSingle();
    if (!old) return json({ error: "Key not found" }, 404);
    try {
      const minted = await mintKey(old.name || "Rotated key");
      await admin.from("api_keys").update({ revoked: true }).eq("id", keyId).eq("merchant_id", merchantId);
      await audit("api_key.rotated", minted.id, { rotated_from: keyId, name: minted.name });
      return json(minted, 200);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Rotate failed" }, 400);
    }
  }

  if (action === "revoke") {
    const { error } = await admin.from("api_keys").update({ revoked: true }).eq("id", keyId).eq("merchant_id", merchantId);
    if (error) return json({ error: error.message }, 400);
    await audit("api_key.revoked", keyId ?? null, {});
    return json({ ok: true }, 200);
  }

  return json({ error: "Unknown action" }, 400);
});