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

const DAY = 24 * 60 * 60 * 1000;

// Runs daily (via pg_cron). It:
//  1. Emails merchants whose key expires within 7 days (once per key).
//  2. Revokes keys past their expiry and suspends merchants left with no active key.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const now = Date.now();
  const soon = new Date(now + 7 * DAY).toISOString();
  const nowIso = new Date(now).toISOString();

  let alertsSent = 0;
  let keysExpired = 0;
  let merchantsSuspended = 0;

  async function sendAlert(merchant: any, key: any, daysLeft: number) {
    const to = merchant.contact_email || merchant.mobile_email || null;
    if (!to) return;
    try {
      await admin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "api-key-expiry",
          recipientEmail: to,
          idempotencyKey: `apikey-expiry-${key.id}`,
          templateData: {
            merchantName: merchant.name,
            keyName: key.name || "API key",
            keyPrefix: key.key_prefix,
            daysLeft,
            expiresAt: key.expires_at,
          },
        },
      });
    } catch (_e) {
      // Email infra may not be configured yet — alert flag is still set so we don't loop.
    }
  }

  // 1) Upcoming expiry alerts (within 7 days, not yet alerted).
  const { data: expiring } = await admin
    .from("api_keys")
    .select("id, name, key_prefix, expires_at, merchant_id, merchants(name, contact_email)")
    .eq("revoked", false)
    .not("expires_at", "is", null)
    .lte("expires_at", soon)
    .gt("expires_at", nowIso)
    .is("expiry_alert_sent_at", null);

  for (const k of expiring ?? []) {
    const daysLeft = Math.max(1, Math.ceil((new Date(k.expires_at).getTime() - now) / DAY));
    await sendAlert((k as any).merchants, k, daysLeft);
    await admin.from("api_keys").update({ expiry_alert_sent_at: nowIso }).eq("id", k.id);
    alertsSent++;
  }

  // 2) Expired keys -> revoke.
  const { data: expired } = await admin
    .from("api_keys")
    .select("id, merchant_id")
    .eq("revoked", false)
    .not("expires_at", "is", null)
    .lte("expires_at", nowIso);

  const affectedMerchants = new Set<string>();
  for (const k of expired ?? []) {
    await admin.from("api_keys").update({ revoked: true }).eq("id", k.id);
    affectedMerchants.add(k.merchant_id);
    keysExpired++;
  }

  // 3) Auto-deactivate merchants with no remaining active key.
  for (const merchantId of affectedMerchants) {
    const { count } = await admin
      .from("api_keys")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchantId)
      .eq("revoked", false)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
    if ((count ?? 0) === 0) {
      await admin.from("merchants").update({ status: "suspended" }).eq("id", merchantId).eq("status", "active");
      await admin.from("audit_logs").insert({
        actor_email: "system", merchant_id: merchantId, action: "merchant.auto_suspended",
        target_type: "merchant", target_id: merchantId, metadata: { reason: "api_key_expired" },
      });
      merchantsSuspended++;
    }
  }

  return json({ ok: true, alertsSent, keysExpired, merchantsSuspended }, 200);
});