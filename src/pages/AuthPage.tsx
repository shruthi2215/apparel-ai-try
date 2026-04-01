import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff, ArrowLeft, Phone, Lock, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep =
  | "phone_input"      // Enter phone number
  | "otp_verify"       // Enter OTP
  | "create_password"  // First-time signup: set password + name
  | "signin_password"  // Returning user: enter password
  | "forgot_password"  // Reset password via OTP
  | "reset_otp"        // Verify OTP for password reset
  | "new_password";    // Set new password after reset

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>("phone_input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length >= 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  // Step 1: Send OTP to phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhone(phone);
    if (formatted.length < 12) {
      toast({ title: "Invalid number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OTP Sent!", description: `We sent a 6-digit code to ${formatted}` });
      setStep("otp_verify");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const formatted = formatPhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    if (error) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check if user has a password set (existing user) by checking profile
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", data.user.id)
        .single();

      if (profile?.display_name && profile.display_name !== data.user.phone) {
        // Existing user with profile — go to password sign-in
        setIsNewUser(false);
        toast({ title: "Welcome back!", description: "Please enter your password." });
        setStep("signin_password");
      } else {
        // New user — create password
        setIsNewUser(true);
        toast({ title: "Phone verified!", description: "Create your account to continue." });
        setStep("create_password");
      }
    }
    setLoading(false);
  };

  // Step 3a: Create password for new user
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Update user with password and metadata
    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: name },
    });

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Update profile with display name and phone
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        display_name: name || undefined,
        phone: formatPhone(phone),
      }).eq("user_id", user.id);
    }

    toast({ title: "Account created!", description: "Welcome to Try On Me." });
    navigate("/");
    setLoading(false);
  };

  // Step 3b: Sign in with password (existing user)
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formatted = formatPhone(phone);

    // User is already authenticated via OTP, just verify the concept
    // For password-based re-auth, we sign out and sign in with phone+password
    const { error } = await supabase.auth.signInWithPassword({
      phone: formatted,
      password,
    });

    if (error) {
      // User might already be logged in from OTP verification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/");
      } else {
        toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
      }
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  // Forgot password: send OTP for reset
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhone(phone);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OTP Sent!", description: "Enter the code to reset your password." });
      setStep("reset_otp");
    }
    setLoading(false);
  };

  // Verify OTP for password reset
  const handleResetOtpVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const formatted = formatPhone(phone);
    const { error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    if (error) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    } else {
      setStep("new_password");
    }
    setLoading(false);
  };

  // Set new password after reset
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You're now signed in." });
      navigate("/");
    }
    setLoading(false);
  };

  const resetFlow = () => {
    setStep("phone_input");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  const inputClass = "bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-12";

  const getTitle = () => {
    switch (step) {
      case "phone_input": return "Welcome";
      case "otp_verify": return "Verify OTP";
      case "create_password": return "Create Account";
      case "signin_password": return "Welcome Back";
      case "forgot_password": return "Reset Password";
      case "reset_otp": return "Verify Code";
      case "new_password": return "New Password";
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case "phone_input": return "Enter your mobile number to get started";
      case "otp_verify": return `Enter the 6-digit code sent to ${formatPhone(phone)}`;
      case "create_password": return "Set up your account details";
      case "signin_password": return "Enter your password to continue";
      case "forgot_password": return "We'll send an OTP to reset your password";
      case "reset_otp": return `Enter the code sent to ${formatPhone(phone)}`;
      case "new_password": return "Choose a new password for your account";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => step === "phone_input" ? navigate("/") : resetFlow()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === "phone_input" ? "Back to home" : "Start over"}
        </button>

        <div className="glass-card rounded-3xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Try On <span className="gradient-gold-text">Me</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">{getTitle()}</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">{getSubtitle()}</p>

          {/* STEP: Phone Input */}
          {step === "phone_input" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          )}

          {/* STEP: OTP Verify */}
          {(step === "otp_verify" || step === "reset_otp") && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={step === "otp_verify" ? handleVerifyOtp : handleResetOtpVerify}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                onClick={() => { setOtp(""); handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
                className="w-full text-center font-body text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* STEP: Create Password (New User) */}
          {step === "create_password" && (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Email (optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10 pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10`} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* STEP: Sign In with Password */}
          {step === "signin_password" && (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClass} pl-10 pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              <button
                type="button"
                onClick={() => { setPassword(""); setStep("forgot_password"); }}
                className="w-full text-center font-body text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </form>
          )}

          {/* STEP: Forgot Password */}
          {step === "forgot_password" && (
            <form onSubmit={handleForgotSendOtp} className="space-y-4">
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="tel" placeholder="Your registered mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required className={`${inputClass} pl-10`} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
              <button type="button" onClick={resetFlow} className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground">
                Back to login
              </button>
            </form>
          )}

          {/* STEP: Set New Password */}
          {step === "new_password" && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10 pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-foreground/80 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={`${inputClass} pl-10`} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-body font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
