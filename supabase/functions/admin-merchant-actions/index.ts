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

  // Only platform admins / super admins may perform these actions.
  const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", user.id);
  const roles = (roleRows ?? []).map((r: any) => r.role);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const { action, merchantId, limits, planSlug } = body || {};
  if (!merchantId) return json({ error: "merchantId required" }, 400);

  const { data: merchant } = await admin
    .from("merchants").select("*").eq("id", merchantId).maybeSingle();
  if (!merchant) return json({ error: "Merchant not found" }, 404);

  async function audit(act: string, metadata: Record<string, unknown> = {}) {
    await admin.from("audit_logs").insert({
      actor_user_id: user.id, actor_email: user.email, merchant_id: merchantId,
      action: act, target_type: "merchant", target_id: merchantId, metadata,
    });
  }

  async function grantRole(uid: string, role: string) {
    await admin.from("user_roles").insert({ user_id: uid, role }).then(() => {});
  }

  switch (action) {
    case "approve": {
      // Default plan = Starter
      const { data: starter } = await admin
        .from("subscription_plans").select("*").eq("slug", "starter").maybeSingle();
      await admin.from("merchants").update({
        status: "active",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        plan_id: merchant.plan_id ?? starter?.id ?? null,
        monthly_quota: merchant.monthly_quota ?? starter?.monthly_quota ?? 500,
        rate_limit_per_min: merchant.rate_limit_per_min ?? starter?.rate_limit_per_min ?? 30,
      }).eq("id", merchantId);

      // Grant merchant role to the owner
      await grantRole(merchant.owner_user_id, "merchant");

      // Ensure a subscription record exists
      const { data: existingSub } = await admin
        .from("merchant_subscriptions").select("id").eq("merchant_id", merchantId).maybeSingle();
      if (!existingSub && starter) {
        await admin.from("merchant_subscriptions").insert({
          merchant_id: merchantId, plan_id: starter.id, status: "active",
        });
      }
      await audit("merchant.approved", {});
      return json({ ok: true }, 200);
    }
    case "reject": {
      await admin.from("merchants").update({ status: "rejected" }).eq("id", merchantId);
      await audit("merchant.rejected", {});
      return json({ ok: true }, 200);
    }
    case "suspend": {
      await admin.from("merchants").update({ status: "suspended" }).eq("id", merchantId);
      await audit("merchant.suspended", {});
      return json({ ok: true }, 200);
    }
    case "reactivate": {
      await admin.from("merchants").update({ status: "active" }).eq("id", merchantId);
      await audit("merchant.reactivated", {});
      return json({ ok: true }, 200);
    }
    case "update_limits": {
      const patch: Record<string, unknown> = {};
      if (typeof limits?.rate_limit_per_min === "number") patch.rate_limit_per_min = limits.rate_limit_per_min;
      if (typeof limits?.monthly_quota === "number") patch.monthly_quota = limits.monthly_quota;
      if (Object.keys(patch).length === 0) return json({ error: "No valid limits" }, 400);
      await admin.from("merchants").update(patch).eq("id", merchantId);
      await audit("merchant.limits_updated", patch);
      return json({ ok: true }, 200);
    }
    case "set_plan": {
      const { data: plan } = await admin
        .from("subscription_plans").select("*").eq("slug", planSlug).maybeSingle();
      if (!plan) return json({ error: "Plan not found" }, 404);
      await admin.from("merchants").update({
        plan_id: plan.id,
        monthly_quota: plan.monthly_quota,
        rate_limit_per_min: plan.rate_limit_per_min,
      }).eq("id", merchantId);
      const { data: sub } = await admin
        .from("merchant_subscriptions").select("id").eq("merchant_id", merchantId).maybeSingle();
      if (sub) {
        await admin.from("merchant_subscriptions").update({ plan_id: plan.id, status: "active" }).eq("id", sub.id);
      } else {
        await admin.from("merchant_subscriptions").insert({ merchant_id: merchantId, plan_id: plan.id, status: "active" });
      }
      await audit("merchant.plan_changed", { plan: plan.slug });
      return json({ ok: true }, 200);
    }
    default:
      return json({ error: "Unknown action" }, 400);
  }
});