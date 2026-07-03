import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { CheckCircle2, Ban, RotateCcw, XCircle, Sliders, Search, Clock, Eye, ExternalLink, Globe, Mail, Phone, FileText, KeyRound, Activity } from "lucide-react";

interface Merchant {
  id: string; name: string; website_url: string | null; status: string;
  owner_user_id: string; contact_email: string | null; created_at: string;
  rate_limit_per_min: number; monthly_quota: number; plan_id: string | null;
  contact_name?: string | null; mobile?: string | null; gstin?: string | null;
}
interface Plan { id: string; name: string; slug: string; }

const statusVariant = (s: string) =>
  s === "active" ? "default" : s === "pending" ? "secondary" : "destructive";

export default function MerchantsAdmin() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [keyCounts, setKeyCounts] = useState<Record<string, number>>({});
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Merchant | null>(null);
  const [detail, setDetail] = useState<Merchant | null>(null);
  const [rl, setRl] = useState(0);
  const [mq, setMq] = useState(0);
  const [planSlug, setPlanSlug] = useState("");

  const load = async () => {
    const [{ data: m }, { data: p }, { data: keys }, { data: reqs }] = await Promise.all([
      supabase.from("merchants").select("*").order("created_at", { ascending: false }),
      supabase.from("subscription_plans").select("id,name,slug").order("sort_order"),
      supabase.from("api_keys").select("merchant_id,revoked"),
      supabase.from("tryon_requests").select("merchant_id"),
    ]);
    setMerchants((m ?? []) as Merchant[]);
    setPlans((p ?? []) as Plan[]);
    const kc: Record<string, number> = {};
    (keys ?? []).forEach((k: any) => { if (!k.revoked) kc[k.merchant_id] = (kc[k.merchant_id] || 0) + 1; });
    setKeyCounts(kc);
    const uc: Record<string, number> = {};
    (reqs ?? []).forEach((r: any) => { uc[r.merchant_id] = (uc[r.merchant_id] || 0) + 1; });
    setUsage(uc);
  };
  useEffect(() => { load(); }, []);

  const act = async (merchantId: string, action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-merchant-actions", {
      body: { action, merchantId, ...extra },
    });
    setBusy(false);
    if (error || data?.error) { toast.error(error?.message || data?.error); return false; }
    toast.success("Done");
    await load();
    return true;
  };

  const openEdit = (m: Merchant) => {
    setEdit(m); setRl(m.rate_limit_per_min); setMq(m.monthly_quota);
    setPlanSlug(plans.find((p) => p.id === m.plan_id)?.slug || "");
  };

  const saveEdit = async () => {
    if (!edit) return;
    if (planSlug && planSlug !== plans.find((p) => p.id === edit.plan_id)?.slug) {
      await act(edit.id, "set_plan", { planSlug });
    }
    await act(edit.id, "update_limits", { limits: { rate_limit_per_min: rl, monthly_quota: mq } });
    setEdit(null);
  };

  const filtered = useMemo(() => merchants.filter((m) => {
    const q = search.toLowerCase();
    const mq = !q || m.name.toLowerCase().includes(q) || (m.contact_email || "").toLowerCase().includes(q);
    const ms = statusFilter === "all" || m.status === statusFilter;
    return mq && ms;
  }), [merchants, search, statusFilter]);

  const pendingCount = merchants.filter((m) => m.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchants…" className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "active", "suspended", "rejected"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All status" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />{pendingCount} awaiting approval</Badge>
        )}
      </div>

      <Card className="p-0 overflow-hidden border-border/60 bg-card/70 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead><TableHead>Status</TableHead><TableHead>Plan</TableHead>
              <TableHead>Keys</TableHead><TableHead>Usage</TableHead><TableHead>Limits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <button onClick={() => setDetail(m)} className="text-left group">
                    <div className="font-medium group-hover:text-primary transition-colors">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{m.website_url || m.contact_email || "—"}</div>
                  </button>
                </TableCell>
                <TableCell><Badge variant={statusVariant(m.status)} className="capitalize">{m.status}</Badge></TableCell>
                <TableCell className="text-sm">{plans.find((p) => p.id === m.plan_id)?.name || "—"}</TableCell>
                <TableCell>{keyCounts[m.id] || 0}</TableCell>
                <TableCell className="text-sm">{usage[m.id] || 0}<span className="text-muted-foreground">/{m.monthly_quota}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{m.rate_limit_per_min}/min</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {m.status === "pending" && (
                      <>
                        <Button size="sm" disabled={busy} onClick={() => act(m.id, "approve")}><CheckCircle2 className="w-4 h-4 mr-1" />Approve</Button>
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => act(m.id, "reject")}><XCircle className="w-4 h-4 text-destructive" /></Button>
                      </>
                    )}
                    {m.status === "active" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => act(m.id, "suspend")}><Ban className="w-4 h-4 mr-1" />Suspend</Button>
                    )}
                    {(m.status === "suspended" || m.status === "rejected") && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => act(m.id, "reactivate")}><RotateCcw className="w-4 h-4 mr-1" />Reactivate</Button>
                    )}
                    <Button size="icon" variant="ghost" title="View details" onClick={() => setDetail(m)}><Eye className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" title="Edit limits & plan" onClick={() => openEdit(m)}><Sliders className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No merchants found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {edit?.name}</DialogTitle>
            <DialogDescription>Adjust subscription plan, rate limit and monthly quota.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Plan</label>
              <Select value={planSlug} onValueChange={setPlanSlug}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>{plans.map((p) => <SelectItem key={p.id} value={p.slug}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Rate limit /min</label><Input type="number" value={rl} onChange={(e) => setRl(Number(e.target.value))} className="mt-1" /></div>
              <div><label className="text-sm font-medium">Monthly quota</label><Input type="number" value={mq} onChange={(e) => setMq(Number(e.target.value))} className="mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={busy}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}