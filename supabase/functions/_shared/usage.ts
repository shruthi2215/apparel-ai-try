import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

/**
 * Server-side usage + analytics recording for TRYVIOR.
 * Uses the service role so records cannot be forged or edited by clients.
 */

/** Estimated AI cost per generation in cents. Kept here so pricing/margin math has one source. */
export const AI_COST_CENTS = {
  tryon_generation: 7,
  avatar_generation: 9,
} as const;

export type UsageType = "tryon_generation" | "avatar_generation" | "api_call" | "storage";

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/** Resolve the calling user id from the request's bearer token (never trust the body). */
export async function userIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data } = await client.auth.getUser();
  return data?.user?.id ?? null;
}

export async function recordUsage(params: {
  usageType: UsageType;
  merchantId?: string | null;
  userId?: string | null;
  quantity?: number;
  costCents?: number;
  provider?: string;
  model?: string;
  status?: "success" | "failed";
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await admin().from("usage_records").insert({
      merchant_id: params.merchantId ?? null,
      user_id: params.userId ?? null,
      usage_type: params.usageType,
      quantity: params.quantity ?? 1,
      cost_cents: params.costCents ?? 0,
      provider: params.provider ?? null,
      model: params.model ?? null,
      status: params.status ?? "success",
      latency_ms: params.latencyMs ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("recordUsage failed:", err);
  }
}

export async function recordEvent(params: {
  eventType: string;
  merchantId?: string | null;
  userId?: string | null;
  productId?: string | null;
  productName?: string | null;
  category?: string | null;
  color?: string | null;
  status?: string | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await admin().from("analytics_events").insert({
      event_type: params.eventType,
      merchant_id: params.merchantId ?? null,
      user_id: params.userId ?? null,
      product_id: params.productId ?? null,
      product_name: params.productName ?? null,
      category: params.category ?? null,
      color: params.color ?? null,
      status: params.status ?? null,
      duration_ms: params.durationMs ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("recordEvent failed:", err);
  }
}
