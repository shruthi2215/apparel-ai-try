import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { UserPlus, Trash2, Users } from "lucide-react";

interface Member {
  id: string; email: string; role: string; status: string; user_id: string | null; created_at: string;
}
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TeamTab({ merchantId }: { merchantId: string }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("merchant_members").select("*").eq("merchant_id", merchantId).order("created_at");
    setMembers((data ?? []) as Member[]);
  };
  useEffect(() => { load(); }, [merchantId]);

  const invite = async () => {
    const e = email.trim().toLowerCase();
    if (!emailRe.test(e)) { toast.error("Enter a valid email"); return; }
    setBusy(true);
    const { error } = await supabase.from("merchant_members").insert({
      merchant_id: merchantId, email: e, role, status: "pending", invited_by: user?.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message.includes("duplicate") ? "Already invited" : error.message); return; }
    toast.success(`Invited ${e}`);
    setEmail(""); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("merchant_members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Member removed"); load();
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><UserPlus className="w-4 h-4 text-primary" />Invite a team member</h3>
        <div className="flex flex-wrap gap-2">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" className="flex-1 min-w-[200px]" type="email" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={invite} disabled={busy}><UserPlus className="w-4 h-4 mr-1" />Invite</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">They get access automatically when they sign up with this email.</p>
      </Card>

      <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-primary" />Team members</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.email}</TableCell>
                <TableCell className="capitalize">{m.role}</TableCell>
                <TableCell><Badge variant={m.status === "active" ? "default" : "secondary"} className="capitalize">{m.status}</Badge></TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {members.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No team members yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}