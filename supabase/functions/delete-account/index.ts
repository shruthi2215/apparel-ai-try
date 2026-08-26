import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401);

    const admin = createClient(url, serviceKey);
    const uid = user.id;

    // Owners of merchant accounts must transfer/close the business account first.
    const { data: ownedMerchants } = await admin
      .from("merchants")
      .select("id, name")
      .eq("owner_user_id", uid);

    if (ownedMerchants && ownedMerchants.length > 0) {
      return json(
        {
          error:
            "Your account owns a merchant workspace (" +
            ownedMerchants.map((m: { name: string }) => m.name).join(", ") +
            "). Please contact support to transfer or close it before deleting your account.",
        },
        409,
      );
    }

    // Remove stored photos (private buckets are keyed by user id folder).
    for (const bucket of ["user-photos", "avatar-photos"]) {
      const { data: files } = await admin.storage.from(bucket).list(uid, { limit: 1000 });
      if (files?.length) {
        await admin.storage.from(bucket).remove(files.map((f) => `${uid}/${f.name}`));
      }
    }

    // Delete owned application rows.
    const userTables = [
      "cart_items",
      "wishlists",
      "try_on_sessions",
      "orders",
      "user_avatars",
      "user_measurements",
      "notifications",
      "profiles",
      "user_roles",
    ];
    for (const table of userTables) {
      await admin.from(table).delete().eq("user_id", uid);
    }
    await admin.from("support_tickets").delete().eq("created_by", uid);
    await admin.from("merchant_members").delete().eq("user_id", uid);

    // Anonymise immutable analytics/usage records instead of deleting them.
    await admin.from("analytics_events").update({ user_id: null }).eq("user_id", uid);
    await admin.from("usage_records").update({ user_id: null }).eq("user_id", uid);

    await admin.from("audit_logs").insert({
      actor_user_id: null,
      actor_email: user.email ?? null,
      action: "account.deleted",
      target_type: "user",
      target_id: uid,
      metadata: { self_service: true },
    });

    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return json({ error: delErr.message }, 400);

    return json({ success: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
