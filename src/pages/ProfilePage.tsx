import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User, Heart, Clock, Package, Settings, LogOut,
  Camera, Edit3, Check, X, Lock, Eye, EyeOff, AlertTriangle, Trash2
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "history", label: "Try-On History", icon: Clock },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "orders", label: "Orders", icon: Package },
  { id: "security", label: "Security", icon: Lock },
];

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      toast({ title: "Account deleted", description: "Your account and data were permanently removed." });
      await signOut();
      navigate("/");
    } catch (err) {
      toast({
        title: "Couldn't delete account",
        description: err instanceof Error ? err.message : "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };


  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhone(profile.phone || "");
      setGender(profile.gender || "");
      setHeight(profile.body_height_cm?.toString() || "");
      setWeight(profile.body_weight_kg?.toString() || "");
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "history") {
      supabase.from("try_on_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
        .then(({ data }) => setSessions(data || []));
    }
    if (activeTab === "orders") {
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => setOrders(data || []));
    }
  }, [activeTab, user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      phone,
      gender,
      body_height_cm: height ? parseInt(height) : null,
      body_weight_kg: weight ? parseInt(weight) : null,
    }).eq("user_id", user.id);

    if (error) { toast({ title: "Error saving profile", description: error.message, variant: "destructive" }); return; }
    await refreshProfile();
    setEditing(false);
    toast({ title: "Profile updated! ✓" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please re-enter the same password.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) { toast({ title: "Couldn't update password", description: error.message, variant: "destructive" }); return; }
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated! ✓", description: "Your new password is now active." });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Profile Header */}
          <div className="glass-card rounded-3xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center text-white text-3xl font-display font-bold">
                {(profile?.display_name || user.email || "U")[0].toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {profile?.display_name || "User"}
              </h1>
              <p className="font-body text-sm text-muted-foreground">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-body font-semibold">
                  Admin
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="border-white/10 text-muted-foreground hover:text-foreground font-body text-sm"
                >
                  <Settings className="w-4 h-4 mr-2" /> Admin Panel
                </Button>
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-white/10 text-muted-foreground hover:text-foreground font-body text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === id
                    ? "bg-gradient-hero text-white shadow-brand"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="glass-card rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">Personal Information</h2>
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    className="border-white/10 text-muted-foreground hover:text-foreground font-body text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={saveProfile} className="h-9 bg-gradient-hero text-white border-0 rounded-lg font-body text-sm">
                      <Check className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className="h-9 border-white/10 text-muted-foreground font-body text-sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Display Name", value: displayName, setter: setDisplayName, placeholder: "Your name" },
                  { label: "Phone", value: phone, setter: setPhone, placeholder: "+91 XXXXX XXXXX" },
                  { label: "Gender", value: gender, setter: setGender, placeholder: "e.g. Female, Male, Other" },
                  { label: "Height (cm)", value: height, setter: setHeight, placeholder: "e.g. 165" },
                  { label: "Weight (kg)", value: weight, setter: setWeight, placeholder: "e.g. 60" },
                ].map(({ label, value, setter, placeholder }) => (
                  <div key={label}>
                    <label className="font-body text-sm text-muted-foreground mb-1.5 block">{label}</label>
                    {editing ? (
                      <Input
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-11"
                      />
                    ) : (
                      <p className="font-body text-sm text-foreground bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 min-h-[44px]">
                        {value || <span className="text-muted-foreground">Not set</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Try-On History Tab */}
          {activeTab === "history" && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Try-On History</h2>
              {sessions.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">No try-on sessions yet</p>
                  <Button onClick={() => navigate("/try-on")} className="mt-4 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold">
                    Start Your First Try-On
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">Try-On Session</p>
                        <p className="font-body text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-body font-semibold ${
                        s.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                      }`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">My Wishlist</h2>
              <div className="text-center py-16">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-body text-muted-foreground">Your wishlist is empty</p>
                <Button onClick={() => navigate("/products")} className="mt-4 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold">
                  Browse Products
                </Button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">My Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-body text-muted-foreground">No orders yet</p>
                  <Button onClick={() => navigate("/products")} className="mt-4 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold">
                    Shop Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                      <div className="flex-1">
                        <p className="font-body text-sm font-semibold text-foreground">{o.product_name || "Product"}</p>
                        <p className="font-body text-xs text-muted-foreground">₹{o.price} · {o.size} · {o.color}</p>
                        <p className="font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-body font-semibold ${
                        o.status === "delivered" ? "bg-green-500/20 text-green-400" :
                        o.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="glass-card rounded-3xl p-6 md:p-8 max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-xl font-bold text-foreground">Change Password</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Update the password for <span className="text-foreground font-medium">{user.email}</span>. This applies to your account whatever your role.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1.5 block">New password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1.5 block">Confirm new password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-11"
                  />
                </div>
                <Button
                  onClick={changePassword}
                  disabled={changingPassword}
                  className="bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold"
                >
                  <Lock className="w-4 h-4 mr-2" /> {changingPassword ? "Updating…" : "Update Password"}
                </Button>
              </div>

              {/* Danger zone */}
              <div className="mt-10 pt-6 border-t border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-display text-lg font-bold text-foreground">Delete account</h3>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Permanently delete your account, avatar, photos, try-on history, wishlist and cart.
                  This cannot be undone.
                </p>

                {!confirmDelete ? (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-xl border-destructive/40 text-destructive font-body"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete my account
                  </Button>
                ) : (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <p className="font-body text-sm text-foreground">
                      Type <span className="font-semibold">DELETE</span> to confirm.
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="bg-white/5 border-white/10 rounded-xl h-11"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={deleteAccount}
                        disabled={deleting || deleteConfirmText !== "DELETE"}
                        className="rounded-xl bg-destructive text-destructive-foreground font-body"
                      >
                        {deleting ? "Deleting…" : "Permanently delete"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setConfirmDelete(false); setDeleteConfirmText(""); }}
                        className="rounded-xl font-body"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
