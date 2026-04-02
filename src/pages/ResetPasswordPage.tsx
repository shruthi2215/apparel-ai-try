import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Try to get session — user might already be authenticated via recovery link
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setReady(true);
        else navigate("/auth");
      });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      navigate("/");
    }
    setLoading(false);
  };

  if (!ready) return null;

  const inputClass = "bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-12";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Try On <span className="gradient-gold-text">Me</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">New Password</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose a new password for your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground/80 mb-1.5 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10 pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground/80 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
              {loading ? "Updating..." : "Set New Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
