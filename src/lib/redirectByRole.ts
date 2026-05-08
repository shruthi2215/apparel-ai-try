import { supabase } from "@/integrations/supabase/client";

export async function redirectByRole(userId: string, navigate: (path: string) => void) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data || []).map((r) => r.role);
  if (roles.includes("super_admin")) navigate("/super-admin");
  else if (roles.includes("admin")) navigate("/admin");
  else navigate("/");
}