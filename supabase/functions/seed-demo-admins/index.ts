import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const accounts = [
    { email: "superadmin@tryon.ai", password: "Super@123", name: "Super Admin", role: "super_admin" },
    { email: "admin@tryon.ai", password: "Admin@123", name: "Admin User", role: "admin" },
  ] as const;

  const results: any[] = [];

  for (const a of accounts) {
    // Try to create; if already exists, look up by listing users
    let userId: string | null = null;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: a.email,
      password: a.password,
      email_confirm: true,
      user_metadata: { full_name: a.name },
    });

    if (created?.user) {
      userId = created.user.id;
    } else {
      // Find existing
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users.find((u) => u.email === a.email);
      if (existing) {
        userId = existing.id;
        // Reset password to ensure demo creds work
        await supabase.auth.admin.updateUserById(existing.id, { password: a.password });
      }
    }

    if (!userId) {
      results.push({ email: a.email, ok: false, error: createErr?.message });
      continue;
    }

    // Ensure profile exists
    await supabase.from("profiles").upsert(
      { user_id: userId, display_name: a.name, is_admin: true },
      { onConflict: "user_id" }
    );

    // Assign role (idempotent via unique constraint)
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: a.role },
      { onConflict: "user_id,role" }
    );

    results.push({ email: a.email, ok: true, role: a.role });
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});