import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard, Package, Users, ShoppingBag,
  Plus, Upload, X, Save, TrendingUp, BarChart3, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "users", label: "Analytics", icon: BarChart3 },
];

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "Kurtis", price: "", brand: "", description: "", image_url: "", colors: "", sizes: "",
  });

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      navigate("/");
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
    supabase.from("try_on_sessions").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setSessions(data || []));
  }, [profile]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) { toast({ title: "Name and price are required", variant: "destructive" }); return; }
    const { error } = await supabase.from("products").insert({
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      brand: newProduct.brand || null,
      description: newProduct.description || null,
      image_url: newProduct.image_url || null,
      colors: newProduct.colors ? newProduct.colors.split(",").map(s => s.trim()) : [],
      sizes: newProduct.sizes ? newProduct.sizes.split(",").map(s => s.trim()) : [],
    });
    if (error) { toast({ title: "Error adding product", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Product added! ✓" });
    setShowAddProduct(false);
    setNewProduct({ name: "", category: "Kurtis", price: "", brand: "", description: "", image_url: "", colors: "", sizes: "" });
    supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Product deleted" });
  };

  if (loading) return null;
  if (!profile?.is_admin) return null;

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-gold" },
    { label: "Try-On Sessions", value: sessions.length, icon: Activity, color: "text-green-400" },
    { label: "Revenue", value: `₹${orders.reduce((s, o) => s + Number(o.price || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-1">Admin <span className="gradient-gold-text">Dashboard</span></h1>
            <p className="font-body text-muted-foreground text-sm">Manage products, orders and platform analytics</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === id ? "bg-gradient-hero text-white shadow-brand" : "glass-card text-muted-foreground hover:text-foreground"
              }`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="glass-card rounded-2xl p-5">
                    <div className={`mb-3 ${color}`}><Icon className="w-6 h-6" /></div>
                    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                    <p className="font-body text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Try-On Sessions</h3>
                {sessions.slice(0, 5).length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No sessions yet</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                        <p className="font-body text-sm text-foreground">Session #{s.id.slice(0, 8)}...</p>
                        <div className="flex items-center gap-3">
                          <span className="font-body text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("en-IN")}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${s.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>

              {showAddProduct && (
                <div className="glass-card rounded-2xl p-6 border border-primary/20">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Add New Product</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Product Name *", placeholder: "e.g. Floral Kurti" },
                      { key: "brand", label: "Brand", placeholder: "e.g. Biba" },
                      { key: "price", label: "Price (₹) *", placeholder: "e.g. 1299" },
                      { key: "image_url", label: "Image URL", placeholder: "https://..." },
                      { key: "colors", label: "Colors (comma separated)", placeholder: "Red, Blue, Green" },
                      { key: "sizes", label: "Sizes (comma separated)", placeholder: "S, M, L, XL" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="font-body text-sm text-muted-foreground mb-1 block">{label}</label>
                        <Input
                          value={(newProduct as any)[key]}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="font-body text-sm text-muted-foreground mb-1 block">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-foreground rounded-xl px-3 py-2.5 font-body text-sm"
                      >
                        {["Sarees","Kurtis","Dresses","Shirts","Kids Wear","Accessories","other"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-body text-sm text-muted-foreground mb-1 block">Description</label>
                      <Input value={newProduct.description} onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))} placeholder="Product description" className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={addProduct} className="bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold">
                      <Save className="w-4 h-4 mr-2" /> Save Product
                    </Button>
                    <Button onClick={() => setShowAddProduct(false)} variant="outline" className="border-white/10 text-muted-foreground font-body">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Product", "Category", "Price", "Brand", "Stock", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 font-body text-muted-foreground">No products yet. Add your first product above.</td></tr>
                      ) : products.map((p) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-12 object-cover rounded-lg" />}
                              <span className="font-body text-sm text-foreground font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground">{p.category}</td>
                          <td className="px-4 py-3 font-body text-sm text-foreground font-semibold">₹{Number(p.price).toLocaleString()}</td>
                          <td className="px-4 py-3 font-body text-sm text-muted-foreground">{p.brand || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${p.in_stock ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {p.in_stock ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-300 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Order ID", "Product", "Price", "Status", "Date"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-body text-sm font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 font-body text-muted-foreground">No orders yet.</td></tr>
                    ) : orders.map((o) => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 font-body text-xs text-muted-foreground">#{o.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-body text-sm text-foreground">{o.product_name || "N/A"}</td>
                        <td className="px-4 py-3 font-body text-sm text-foreground font-semibold">₹{Number(o.price).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                            o.status === "delivered" ? "bg-green-500/20 text-green-400" :
                            o.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 font-body text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "users" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Try-On Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Total Sessions</span>
                    <span className="font-body text-lg font-bold text-foreground">{sessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Completed</span>
                    <span className="font-body text-lg font-bold text-green-400">{sessions.filter(s => s.status === "completed").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Pending</span>
                    <span className="font-body text-lg font-bold text-yellow-400">{sessions.filter(s => s.status === "pending").length}</span>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Revenue Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-body text-lg font-bold text-foreground">₹{orders.reduce((s, o) => s + Number(o.price || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Total Orders</span>
                    <span className="font-body text-lg font-bold text-foreground">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-muted-foreground">Avg. Order Value</span>
                    <span className="font-body text-lg font-bold text-foreground">
                      {orders.length > 0 ? `₹${Math.round(orders.reduce((s, o) => s + Number(o.price || 0), 0) / orders.length).toLocaleString()}` : "₹0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
