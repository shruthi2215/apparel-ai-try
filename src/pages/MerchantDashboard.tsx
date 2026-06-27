import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, Plus, Copy, Check, Trash2, KeyRound, Globe, BarChart3,
  CheckCircle2, XCircle, Clock, Webhook, CreditCard, Code2, Sparkles, ShieldCheck,
  RefreshCw, Users, Settings, AlertTriangle, Hourglass, Ban,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import TeamTab from "@/components/merchant/TeamTab";
import BillingTab from "@/components/merchant/BillingTab";
import SettingsTab from "@/components/merchant/SettingsTab";

interface Merchant { id: string; name: string; website_url: string | null; status: string; created_at: string; plan_id: string | null; monthly_quota: number | null; rate_limit_per_min: number | null; contact_email: string | null; }
interface ApiKey { id: string; name: string | null; key_prefix: string; revoked: boolean; last_used_at: string | null; created_at: string; }
interface TryReq { id: string; product_name: string | null; status: string; latency_ms: number | null; created_at: string; }

export default function MerchantDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [reqs, setReqs] = useState<TryReq[]>([]);
  const [busy, setBusy] = useState(true);

  // create-merchant form
  const [bizName, setBizName] = useState("");
  const [bizSite, setBizSite] = useState("");

  // new key dialog
  const [keyName, setKeyName] = useState("");
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const loadAll = async () => {
    if (!user) return;
    setBusy(true);
    const { data: m } = await supabase
      .from("merchants").select("*").eq("owner_user_id", user.id)
      .order("created_at", { ascending: true }).limit(1).maybeSingle();
    setMerchant(m as Merchant | null);
    if (m) {
      const [{ data: k }, { data: r }] = await Promise.all([
        supabase.from("api_keys").select("id,name,key_prefix,revoked,last_used_at,created_at").eq("merchant_id", m.id).order("created_at", { ascending: false }),
        supabase.from("tryon_requests").select("id,product_name,status,latency_ms,created_at").eq("merchant_id", m.id).order("created_at", { ascending: false }).limit(500),
      ]);
      setKeys((k ?? []) as ApiKey[]);
      setReqs((r ?? []) as TryReq[]);
    }
    setBusy(false);
  };

  useEffect(() => { if (user) loadAll(); }, [user]);

  const createMerchant = async () => {
    if (!user || !bizName.trim()) { toast.error("Enter a business name"); return; }
    const { error } = await supabase.from("merchants").insert({
      owner_user_id: user.id, name: bizName.trim(), website_url: bizSite.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Merchant account created");
    setBizName(""); setBizSite("");
    loadAll();
  };

  const createKey = async () => {
    if (!merchant) return;
    const { data, error } = await supabase.functions.invoke("merchant-keys", {
      body: { action: "create", merchantId: merchant.id, name: keyName || "Default key" },
    });
    if (error || data?.error) { toast.error(error?.message || data?.error); return; }
    setNewKey(data.key);
    setKeyName("");
    loadAll();
  };

  const revokeKey = async (id: string) => {
    if (!merchant) return;
    const { error } = await supabase.functions.invoke("merchant-keys", {
      body: { action: "revoke", merchantId: merchant.id, keyId: id },
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Key revoked");
    loadAll();
  };

  const rotateKey = async (id: string) => {
    if (!merchant) return;
    const { data, error } = await supabase.functions.invoke("merchant-keys", {
      body: { action: "rotate", merchantId: merchant.id, keyId: id },
    });
    if (error || data?.error) { toast.error(error?.message || data?.error); return; }
    setNewKey(data.key);
    setShowKeyDialog(true);
    toast.success("Key rotated — old key revoked");
    loadAll();
  };

  const copyKey = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ---- analytics ----
  const stats = useMemo(() => {
    const total = reqs.length;
    const ok = reqs.filter((r) => r.status === "success").length;
    const failed = total - ok;
    const avg = reqs.filter((r) => r.latency_ms).reduce((a, r) => a + (r.latency_ms || 0), 0) / (reqs.filter((r) => r.latency_ms).length || 1);
    return { total, ok, failed, avg: Math.round(avg), rate: total ? Math.round((ok / total) * 100) : 0 };
  }, [reqs]);

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(5, 10), 0);
    }
    reqs.forEach((r) => {
      const k = r.created_at.slice(5, 10);
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map, ([date, count]) => ({ date, count }));
  }, [reqs]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    reqs.forEach((r) => { const n = r.product_name || "Unknown"; map.set(n, (map.get(n) || 0) + 1); });
    return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [reqs]);

  if (loading || busy) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">Loading dashboard…</div>
      </div>
    );
  }

  // ---- onboarding (no merchant yet) ----
  if (!merchant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 border-border/60 backdrop-blur-xl bg-card/70">
              <div className="flex items-center gap-2 text-primary mb-2"><Sparkles className="w-5 h-5" /><span className="font-semibold">Merchant Dashboard</span></div>
              <h1 className="text-2xl font-bold mb-1">Create your merchant account</h1>
              <p className="text-muted-foreground text-sm mb-6">Set up your business to generate API keys and start integrating TryOnMe on your store.</p>
              <div className="space-y-4">
                <div><label className="text-sm font-medium">Business name *</label><Input value={bizName} onChange={(e) => setBizName(e.target.value)} placeholder="Acme Fashion" className="mt-1" /></div>
                <div><label className="text-sm font-medium">Website URL</label><Input value={bizSite} onChange={(e) => setBizSite(e.target.value)} placeholder="https://acme.com" className="mt-1" /></div>
                <Button onClick={createMerchant} className="w-full">Create account</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6 text-primary" />{merchant.name}</h1>
            <p className="text-sm text-muted-foreground">{merchant.website_url || "No website set"}</p>
          </div>
          <Badge variant={merchant.status === "active" ? "default" : "destructive"} className="capitalize">{merchant.status}</Badge>
        </div>

        {merchant.status !== "active" && (
          <Card className={`p-4 mb-6 border flex items-start gap-3 ${merchant.status === "suspended" || merchant.status === "rejected" ? "border-destructive/40 bg-destructive/5" : "border-amber-500/40 bg-amber-500/5"}`}>
            {merchant.status === "pending" && <Hourglass className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            {merchant.status === "suspended" && <Ban className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
            {merchant.status === "rejected" && <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
            <div>
              <p className="font-medium text-sm">
                {merchant.status === "pending" && "Awaiting Super Admin approval"}
                {merchant.status === "suspended" && "Account suspended"}
                {merchant.status === "rejected" && "Application not approved"}
              </p>
              <p className="text-sm text-muted-foreground">
                {merchant.status === "pending" && "Your merchant account is under review. API keys can be issued once an admin approves your business."}
                {merchant.status === "suspended" && "Your API access is paused. Contact support to reactivate your account."}
                {merchant.status === "rejected" && "Please update your business details and contact support to re-apply."}
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total try-ons", value: stats.total, icon: Activity },
            { label: "Successful", value: stats.ok, icon: CheckCircle2 },
            { label: "Failed", value: stats.failed, icon: XCircle },
            { label: "Quota used", value: `${stats.total}/${merchant.monthly_quota ?? "∞"}`, icon: Clock },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 border-border/60 bg-card/70 backdrop-blur-xl">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{s.label}</span><s.icon className="w-4 h-4 text-primary" /></div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="analytics">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" />Analytics</TabsTrigger>
            <TabsTrigger value="keys"><KeyRound className="w-4 h-4 mr-1" />API Keys</TabsTrigger>
            <TabsTrigger value="install"><Code2 className="w-4 h-4 mr-1" />Install</TabsTrigger>
            <TabsTrigger value="webhooks"><Webhook className="w-4 h-4 mr-1" />Webhooks</TabsTrigger>
            <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-1" />Billing</TabsTrigger>
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
                <h3 className="font-semibold mb-3 text-sm">Daily usage (14 days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={daily}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
                <h3 className="font-semibold mb-3 text-sm">Most tried products</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topProducts} layout="vertical">
                    <XAxis type="number" fontSize={11} allowDecimals={false} /><YAxis type="category" dataKey="name" width={90} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
              <h3 className="font-semibold mb-3 text-sm">Recent requests</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead><TableHead>When</TableHead></TableRow></TableHeader>
                <TableBody>
                  {reqs.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.product_name || "—"}</TableCell>
                      <TableCell><Badge variant={r.status === "success" ? "default" : "destructive"}>{r.status}</Badge></TableCell>
                      <TableCell>{r.latency_ms ? `${(r.latency_ms / 1000).toFixed(1)}s` : "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {reqs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No requests yet. Integrate the SDK to start.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="keys" className="space-y-4 mt-4">
            <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" />API Keys</h3>
                <Button size="sm" onClick={() => { setShowKeyDialog(true); setNewKey(null); }}><Plus className="w-4 h-4 mr-1" />Generate key</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Last used</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell>{k.name}</TableCell>
                      <TableCell className="font-mono text-xs">{k.key_prefix}…</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</TableCell>
                      <TableCell>{k.revoked ? <Badge variant="destructive">Revoked</Badge> : <Badge>Active</Badge>}</TableCell>
                      <TableCell>{!k.revoked && <Button size="icon" variant="ghost" onClick={() => revokeKey(k.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}</TableCell>
                    </TableRow>
                  ))}
                  {keys.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No keys yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Install */}
          <TabsContent value="install" className="space-y-4 mt-4">
            <Card className="p-5 border-border/60 bg-card/70 backdrop-blur-xl space-y-4">
              <h3 className="font-semibold text-sm">Quick install — JavaScript widget</h3>
              <p className="text-sm text-muted-foreground">Paste this before <code>&lt;/body&gt;</code> on your store, then tag product images with <code>data-tryon</code>.</p>
              <pre className="bg-muted/60 rounded-lg p-4 text-xs overflow-x-auto"><code>{`<script src="${window.location.origin}/sdk/tryonme.js"></script>
<script>
  TryOnMe.init({
    apiKey: "${keys.find((k) => !k.revoked)?.key_prefix || "tk_live_xxx"}…",
    merchantId: "${merchant.id}"
  });
</script>

<!-- Mark any product image: -->
<img src="dress.jpg" data-tryon
     data-product-id="SKU-123"
     data-product-name="Anarkali Kurti"
     data-product-category="kurti" />`}</code></pre>
              <Button variant="outline" onClick={() => navigate("/api-docs")}><Code2 className="w-4 h-4 mr-1" />Full API & SDK docs</Button>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="mt-4">
            <Card className="p-6 border-border/60 bg-card/70 backdrop-blur-xl text-center text-muted-foreground">
              <Webhook className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-foreground">Webhooks</p>
              <p className="text-sm">Configure endpoints to receive <code>tryon.completed</code> and <code>tryon.failed</code> events. Coming soon.</p>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Starter", price: "Free", feats: ["500 try-ons/mo", "1 website", "Community support"] },
                { name: "Growth", price: "$49/mo", feats: ["10,000 try-ons/mo", "5 websites", "Email support", "Webhooks"], hot: true },
                { name: "Enterprise", price: "Custom", feats: ["Unlimited try-ons", "White-label", "SLA + dedicated AI", "Priority support"] },
              ].map((p) => (
                <Card key={p.name} className={`p-6 border-border/60 bg-card/70 backdrop-blur-xl ${p.hot ? "ring-2 ring-primary" : ""}`}>
                  {p.hot && <Badge className="mb-2">Popular</Badge>}
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <div className="text-2xl font-bold my-2">{p.price}</div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">{p.feats.map((f) => <li key={f} className="flex gap-2"><Check className="w-4 h-4 text-primary" />{f}</li>)}</ul>
                  <Button variant={p.hot ? "default" : "outline"} className="w-full" onClick={() => toast.info("Billing checkout coming soon")}>Choose {p.name}</Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Key dialog */}
      <Dialog open={showKeyDialog} onOpenChange={(o) => { setShowKeyDialog(o); if (!o) setNewKey(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{newKey ? "Save your API key" : "Generate API key"}</DialogTitle></DialogHeader>
          {newKey ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Copy this key now — for security it will <b>not</b> be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted/60 rounded-lg p-3 text-xs break-all font-mono">{newKey}</code>
                <Button size="icon" variant="outline" onClick={() => copyKey(newKey)}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Key name</label>
              <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Production website" />
            </div>
          )}
          <DialogFooter>
            {newKey ? <Button onClick={() => { setShowKeyDialog(false); setNewKey(null); }}>Done</Button>
              : <Button onClick={createKey}>Generate</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}