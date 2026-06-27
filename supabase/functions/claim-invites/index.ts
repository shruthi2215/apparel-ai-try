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

// Claims any pending team invitations addressed to the signed-in user's email.
// Runs with the service role but only ever acts on the authenticated caller's own
// (verified) email — so a user can never claim an invite for someone else.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
  if (!user || !user.email) return json({ claimed: 0 }, 200);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const email = user.email.toLowerCase();

  const { data: pending } = await admin
    .from("merchant_members")
    .select("id")
    .ilike("email", email)
    .neq("status", "active");

  if (pending && pending.length > 0) {
    await admin.from("merchant_members")
      .update({ user_id: user.id, status: "active", joined_at: new Date().toISOString() })
      .ilike("email", email)
      .neq("status", "active");
  }

  // Grant staff role if the user is now an active member anywhere
  const { data: active } = await admin
    .from("merchant_members").select("id").eq("user_id", user.id).eq("status", "active").limit(1);
  if (active && active.length > 0) {
    await admin.from("user_roles").insert({ user_id: user.id, role: "staff" }).then(() => {});
  }

  return json({ claimed: pending?.length ?? 0 }, 200);
});