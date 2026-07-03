import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// Handles plan selection for merchants.
// - Free plan: activates immediately (service role).
// - Paid plans: returns a checkout intent. Once Paddle billing is activated for
//   the project, this returns a hosted checkout URL; until then it signals that
//   billing activation is pending so the UI can inform the merchant.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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
  const { merchantId, planSlug } = body || {};
  if (!merchantId || !planSlug) return json({ error: "merchantId and planSlug required" }, 400);

  // Authorize: must own the merchant (or be admin)
  const { data: merchant } = await admin
    .from("merchants").select("id, owner_user_id, status").eq("id", merchantId).maybeSingle();
  if (!merchant) return json({ error: "Merchant not found" }, 404);
  const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = (roleRows ?? []).some((r: any) => ["admin", "super_admin"].includes(r.role));
  if (merchant.owner_user_id !== user.id && !isAdmin) return json({ error: "Forbidden" }, 403);
  if (merchant.status !== "active") return json({ error: "Merchant must be approved first." }, 403);

  const { data: plan } = await admin
    .from("subscription_plans").select("*").eq("slug", planSlug).eq("is_active", true).maybeSingle();
  if (!plan) return json({ error: "Plan not available" }, 404);

  async function applyPlan(status: string, provider: string | null) {
    await admin.from("merchants").update({
      plan_id: plan.id, monthly_quota: plan.monthly_quota, rate_limit_per_min: plan.rate_limit_per_min,
    }).eq("id", merchantId);
    const { data: sub } = await admin.from("merchant_subscriptions").select("id").eq("merchant_id", merchantId).maybeSingle();
    const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + 1);
    const payload = {
      plan_id: plan.id, status, provider,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    };
    let subscriptionId = sub?.id ?? null;
    if (sub) {
      await admin.from("merchant_subscriptions").update(payload).eq("id", sub.id);
    } else {
      const { data: inserted } = await admin
        .from("merchant_subscriptions").insert({ merchant_id: merchantId, ...payload }).select("id").maybeSingle();
      subscriptionId = inserted?.id ?? null;
    }
    await admin.from("audit_logs").insert({
      actor_user_id: user.id, actor_email: user.email, merchant_id: merchantId,
      action: "subscription.changed", target_type: "plan", target_id: plan.slug, metadata: { status },
    });
    return { subscriptionId, periodEnd };
  }

  async function createInvoice(subscriptionId: string | null, periodEnd: Date, invoiceStatus: string) {
    const { data: invoice } = await admin.from("invoices").insert({
      merchant_id: merchantId,
      subscription_id: subscriptionId,
      amount_cents: plan.price_cents,
      currency: plan.currency || "inr",
      status: invoiceStatus,
      description: `${plan.name} — ${plan.monthly_quota.toLocaleString()} try-ons / month`,
      period_start: new Date().toISOString(),
      period_end: periodEnd.toISOString(),
      paid_at: invoiceStatus === "paid" ? new Date().toISOString() : null,
    }).select("id").maybeSingle();
    return invoice?.id ?? null;
  }

  // Free plan activates instantly.
  if (plan.price_cents === 0) {
    const { subscriptionId, periodEnd } = await applyPlan("active", null);
    await createInvoice(subscriptionId, periodEnd, "paid");
    return json({ ok: true, activated: true, free: true }, 200);
  }

  // Paid plan — attempt Paddle checkout if configured.
  const paddleKey = Deno.env.get("PADDLE_API_KEY");
  if (!paddleKey) {
    // Record a pending invoice so the merchant has a billing record while
    // online checkout is being activated for the platform.
    const { subscriptionId, periodEnd } = await applyPlan("pending", null);
    await createInvoice(subscriptionId, periodEnd, "open");
    return json({
      ok: false, billingPending: true,
      message: "Your plan request and invoice have been recorded. Online checkout is being activated — an admin will confirm your payment shortly.",
    }, 200);
  }

  // Placeholder for hosted-checkout creation once Paddle price IDs are mapped.
  return json({ ok: false, billingPending: true, message: "Checkout configuration in progress." }, 200);
});