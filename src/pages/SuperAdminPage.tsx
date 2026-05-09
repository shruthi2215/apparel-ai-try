import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Shield, Package, ShoppingBag, BarChart3,
  TrendingUp, Activity, Ban, CheckCircle2, UserPlus, Trash2,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

type AppRole = "super_admin" | "admin" | "user";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "admins", label: "Admins", icon: Shield },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

const COLORS = ["hsl(var(--primary))", "#c9a84c", "#22c55e", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function SuperAdminPage() {
  const { user, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<typeof TABS[number]["id"]>("overview");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ user_id: string; role: AppRole }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Search + filter + pagination state per tab
  const [adminSearch, setAdminSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState<"all" | "active" | "blocked">("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState<string>("all");
  const [productStock, setProductStock] = useState<"all" | "in" | "out">("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [page, setPage] = useState({ admins: 1, users: 1, products: 1, orders: 1 });
  const PAGE_SIZE = 10;

  // Reset pagination when switching tabs
  useEffect(() => { setPage({ admins: 1, users: 1, products: 1, orders: 1 }); }, [tab]);

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) navigate("/");
  }, [loading, user, isSuperAdmin, navigate]);

  const refresh = async () => {
    const [p, r, pr, o, s] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("try_on_sessions").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(p.data || []);
    setRoles((r.data as any) || []);
    setProducts(pr.data || []);
    setOrders(o.data || []);
    setSessions(s.data || []);
  };

  useEffect(() => { if (isSuperAdmin) refresh(); }, [isSuperAdmin]);

  if (loading || !isSuperAdmin) return null;

  const userRolesMap = new Map<string, AppRole[]>();
  roles.forEach(({ user_id, role }) => {
    userRolesMap.set(user_id, [...(userRolesMap.get(user_id) || []), role]);
  });

  const totalRevenue = orders.reduce((s, o) => s + Number(o.price || 0), 0);
  const adminCount = roles.filter((r) => r.role === "admin" || r.role === "super_admin").length;
  const conversion = sessions.length ? Math.round((orders.length / sessions.length) * 100) : 0;

  // Time-series: last 14 days
  const days: { date: string; users: number; orders: number; sessions: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    days.push({
      date: label,
      users: profiles.filter((x) => x.created_at?.slice(0, 10) === key).length,
      orders: orders.filter((x) => x.created_at?.slice(0, 10) === key).length,
      sessions: sessions.filter((x) => x.created_at?.slice(0, 10) === key).length,
    });
  }

  const categoryData = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const topProducts = (() => {
    const counts = new Map<string, number>();
    sessions.forEach((s) => s.product_id && counts.set(s.product_id, (counts.get(s.product_id) || 0) + 1));
    return Array.from(counts.entries())
      .map(([pid, c]) => ({ name: products.find((p) => p.id === pid)?.name || pid.slice(0, 6), tryons: c }))
      .sort((a, b) => b.tryons - a.tryons).slice(0, 6);
  })();

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
    { label: "Admins", value: adminCount, icon: Shield, color: "text-gold" },
    { label: "Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Try-Ons", value: sessions.length, icon: Activity, color: "text-purple-400" },
    { label: "Conversion", value: `${conversion}%`, icon: BarChart3, color: "text-pink-400" },
  ];

  const promote = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Granted ${role}` }); refresh(); }
  };

  const revoke = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: `Removed ${role}` }); refresh(); }
  };

  const toggleBlock = async (p: any) => {
    const { error } = await supabase.from("profiles").update({ is_blocked: !p.is_blocked }).eq("user_id", p.user_id);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: p.is_blocked ? "User unblocked" : "User blocked" }); refresh(); }
  };

  const grantAdminByEmail = async () => {
    if (!newAdminEmail) return;
    const target = profiles.find((p) => (p.display_name || "").toLowerCase() === newAdminEmail.toLowerCase());
    if (!target) {
      toast({ title: "User not found", description: "User must sign up first.", variant: "destructive" });
      return;
    }
    await promote(target.user_id, "admin");
    setNewAdminEmail("");
  };

  // Derived filtered datasets
  const adminProfiles = profiles.filter((p) => {
    const r = userRolesMap.get(p.user_id) || [];
    if (!(r.includes("admin") || r.includes("super_admin"))) return false;
    const q = adminSearch.toLowerCase();
    return !q || (p.display_name || "").toLowerCase().includes(q) || p.user_id.toLowerCase().includes(q);
  });

  const filteredUsers = profiles.filter((p) => {
    const q = userSearch.toLowerCase();
    const matchQ = !q || (p.display_name || "").toLowerCase().includes(q) || p.user_id.toLowerCase().includes(q);
    const matchS =
      userStatus === "all" ||
      (userStatus === "blocked" && p.is_blocked) ||
      (userStatus === "active" && !p.is_blocked);
    return matchQ && matchS;
  });

  const productCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchQ = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    const matchC = productCategory === "all" || p.category === productCategory;
    const matchS =
      productStock === "all" ||
      (productStock === "in" && p.in_stock) ||
      (productStock === "out" && !p.in_stock);
    return matchQ && matchC && matchS;
  });

  const orderStatuses = Array.from(new Set(orders.map((o) => o.status).filter(Boolean)));
  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase();
    const matchQ =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.product_name || "").toLowerCase().includes(q);
    const matchS = orderStatus === "all" || o.status === orderStatus;
    return matchQ && matchS;
  });

  const paginate = <T,>(rows: T[], p: number) => rows.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-1">
              Super Admin <span className="gradient-gold-text">Console</span>
            </h1>
            <p className="font-body text-muted-foreground text-sm">
              Platform-wide control: roles, users, products, analytics
            </p>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-medium whitespace-nowrap transition-all ${
                  tab === id ? "bg-gradient-hero text-white shadow-brand" : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="glass-card rounded-2xl p-5">
                    <div className={`mb-3 ${color}`}><Icon className="w-6 h-6" /></div>
                    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                    <p className="font-body text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Activity (last 14 days)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={days}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke={COLORS[0]} strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke={COLORS[1]} strokeWidth={2} />
                      <Line type="monotone" dataKey="sessions" stroke={COLORS[2]} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Top Tried Products</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                      <Bar dataKey="tryons" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                  <h3 className="font-display text-lg font-bold mb-4">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === "admins" && (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-display text-lg font-bold mb-3">Grant Admin Role</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter user email or display name"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl"
                  />
                  <Button onClick={grantAdminByEmail} className="bg-gradient-hero text-white border-0 rounded-xl">
                    <UserPlus className="w-4 h-4 mr-2" /> Grant
                  </Button>
                </div>
              </div>

              <FilterBar>
                <SearchInput value={adminSearch} onChange={(v) => { setAdminSearch(v); setPage((s) => ({ ...s, admins: 1 })); }} placeholder="Search admins..." />
              </FilterBar>

              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["User", "Roles", "Joined", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginate(adminProfiles, page.admins).map((p) => {
                      const r = userRolesMap.get(p.user_id) || [];
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 font-body text-sm text-foreground">{p.display_name || p.user_id.slice(0, 8)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {r.map((role) => (
                                <span key={role} className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                                  role === "super_admin" ? "bg-gold/20 text-gold" : "bg-primary/20 text-primary"
                                }`}>{role}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                          <td className="px-4 py-3">
                            {r.includes("admin") && !r.includes("super_admin") && (
                              <button onClick={() => revoke(p.user_id, "admin")} className="text-red-400 hover:text-red-300 text-xs font-body">
                                Revoke admin
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {adminProfiles.length === 0 && <EmptyRow cols={4} />}
                  </tbody>
                </table>
                <Pager total={adminProfiles.length} page={page.admins} onPage={(n) => setPage((s) => ({ ...s, admins: n }))} pageSize={PAGE_SIZE} />
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-4">
              <FilterBar>
                <SearchInput value={userSearch} onChange={(v) => { setUserSearch(v); setPage((s) => ({ ...s, users: 1 })); }} placeholder="Search users..." />
                <SelectChip value={userStatus} onChange={(v) => { setUserStatus(v as any); setPage((s) => ({ ...s, users: 1 })); }} options={[
                  { value: "all", label: "All status" },
                  { value: "active", label: "Active" },
                  { value: "blocked", label: "Blocked" },
                ]} />
              </FilterBar>
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["User", "Roles", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredUsers, page.users).map((p) => {
                    const r = userRolesMap.get(p.user_id) || [];
                    const isSA = r.includes("super_admin");
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 font-body text-sm text-foreground">{p.display_name || p.user_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-body text-xs text-muted-foreground">{r.join(", ") || "user"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                            p.is_blocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                          }`}>{p.is_blocked ? "Blocked" : "Active"}</span>
                        </td>
                        <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3 flex gap-2">
                          {!isSA && (
                            <button onClick={() => toggleBlock(p)} className="text-xs font-body text-muted-foreground hover:text-foreground flex items-center gap-1">
                              {p.is_blocked ? <><CheckCircle2 className="w-3.5 h-3.5" /> Unblock</> : <><Ban className="w-3.5 h-3.5" /> Block</>}
                            </button>
                          )}
                          {!r.includes("admin") && !isSA && (
                            <button onClick={() => promote(p.user_id, "admin")} className="text-xs font-body text-primary hover:underline">
                              Make admin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && <EmptyRow cols={5} />}
                </tbody>
              </table>
              <Pager total={filteredUsers.length} page={page.users} onPage={(n) => setPage((s) => ({ ...s, users: n }))} pageSize={PAGE_SIZE} />
            </div>
            </div>
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <FilterBar>
                <SearchInput value={productSearch} onChange={(v) => { setProductSearch(v); setPage((s) => ({ ...s, products: 1 })); }} placeholder="Search products..." />
                <SelectChip value={productCategory} onChange={(v) => { setProductCategory(v); setPage((s) => ({ ...s, products: 1 })); }} options={[
                  { value: "all", label: "All categories" },
                  ...productCategories.map((c) => ({ value: c, label: c })),
                ]} />
                <SelectChip value={productStock} onChange={(v) => { setProductStock(v as any); setPage((s) => ({ ...s, products: 1 })); }} options={[
                  { value: "all", label: "All stock" },
                  { value: "in", label: "In stock" },
                  { value: "out", label: "Out of stock" },
                ]} />
              </FilterBar>
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Product", "Category", "Price", "Stock", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredProducts, page.products).map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 font-body text-sm text-foreground">{p.name}</td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3 font-body text-sm font-semibold">₹{Number(p.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.in_stock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.in_stock ? "In Stock" : "Out"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            await supabase.from("products").delete().eq("id", p.id);
                            toast({ title: "Product removed" });
                            refresh();
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && <EmptyRow cols={5} />}
                </tbody>
              </table>
              <Pager total={filteredProducts.length} page={page.products} onPage={(n) => setPage((s) => ({ ...s, products: n }))} pageSize={PAGE_SIZE} />
            </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4">
              <FilterBar>
                <SearchInput value={orderSearch} onChange={(v) => { setOrderSearch(v); setPage((s) => ({ ...s, orders: 1 })); }} placeholder="Search by order ID or product..." />
                <SelectChip value={orderStatus} onChange={(v) => { setOrderStatus(v); setPage((s) => ({ ...s, orders: 1 })); }} options={[
                  { value: "all", label: "All status" },
                  ...orderStatuses.map((s) => ({ value: s, label: s })),
                ]} />
              </FilterBar>
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Order", "Product", "Price", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredOrders, page.orders).map((o) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">#{o.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-body text-sm">{o.product_name || "—"}</td>
                      <td className="px-4 py-3 font-body text-sm font-semibold">₹{Number(o.price).toLocaleString()}</td>
                      <td className="px-4 py-3 font-body text-xs">{o.status}</td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <EmptyRow cols={5} />}
                </tbody>
              </table>
              <Pager total={filteredOrders.length} page={page.orders} onPage={(n) => setPage((s) => ({ ...s, orders: n }))} pageSize={PAGE_SIZE} />
            </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                  <Row label="Total Try-On Sessions" value={sessions.length} />
                  <Row label="Completed Sessions" value={sessions.filter((s) => s.status === "completed").length} />
                  <Row label="Orders Placed" value={orders.length} />
                  <Row label="Conversion Rate" value={`${conversion}%`} />
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-4">Revenue</h3>
                <div className="space-y-3">
                  <Row label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
                  <Row label="Avg Order Value" value={orders.length ? `₹${Math.round(totalRevenue / orders.length).toLocaleString()}` : "₹0"} />
                  <Row label="Active Products" value={products.filter((p) => p.in_stock).length} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="font-body text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="glass-card rounded-2xl p-3 flex flex-wrap gap-2 items-center">{children}</div>;
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 bg-white/5 border-white/10 rounded-xl"
      />
    </div>
  );
}

function SelectChip({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
      ))}
    </select>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center font-body text-sm text-muted-foreground">
        No results match your filters.
      </td>
    </tr>
  );
}

function Pager({ total, page, onPage, pageSize }: { total: number; page: number; onPage: (n: number) => void; pageSize: number }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
      <span className="font-body text-xs text-muted-foreground">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg glass-card disabled:opacity-40 hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-body text-xs text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg glass-card disabled:opacity-40 hover:bg-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}