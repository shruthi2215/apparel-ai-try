import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff, ArrowLeft, Phone, Lock, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { redirectByRole } from "@/lib/redirectByRole";

type AuthMode = "login" | "signup" | "forgot_password";
type LoginMethod = "email" | "phone";
type AuthStep =
  | "credentials"       // Enter email/phone + password
  | "phone_otp"         // Verify phone OTP (for phone login/signup)
  | "email_otp"         // Verify email OTP (for email signup verification)
  | "create_account"    // New user: set name + password (after phone OTP)
  | "forgot_input"      // Enter email or phone to reset
  | "forgot_otp"        // Verify OTP for reset
  | "new_password";     // Set new password

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<LoginMethod>("email");
  const [step, setStep] = useState<AuthStep>("credentials");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length >= 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const resetAll = () => {
    setStep("credentials");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetAll();
  };

  // ── Google OAuth ──
  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // ── Resend email confirmation ──
  const handleResendConfirmation = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    toast(error
      ? { title: "Couldn't resend", description: error.message, variant: "destructive" }
      : { title: "Confirmation email sent", description: `Check ${email} and click the link.` });
    setLoading(false);
  };

  // ── Email Login ──
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await redirectByRole(user.id, navigate);
      else navigate("/");
    }
    setLoading(false);
  };

  // ── Email Signup ──
  const handleEmailSignup = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email!", description: "We sent a verification link to your inbox." });
      setStep("email_otp");
    }
    setLoading(false);
  };

  // ── Phone OTP Send ──
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatPhone(phone);
    if (formatted.length < 12) {
      toast({ title: "Invalid number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OTP Sent!", description: `Code sent to ${formatted}` });
      setStep("phone_otp");
    }
    setLoading(false);
  };

  // ── Phone OTP Verify ──
  const handlePhoneVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const formatted = formatPhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (data.user) {
      if (mode === "signup") {
        setStep("create_account");
      } else {
        // Login — check if user has profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", data.user.id)
          .single();
        if (!profile?.display_name || profile.display_name === data.user.phone) {
          setStep("create_account");
        } else {
          toast({ title: "Welcome back!" });
          await redirectByRole(data.user.id, navigate);
        }
      }
    }
    setLoading(false);
  };

  // ── Create Account (after phone OTP) ──
  const handleCreateAccount = async (e: React.FormEvent) => {
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
    const { error } = await supabase.auth.updateUser({
      password,
      data: { full_name: name },
    });
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        display_name: name || undefined,
        phone: formatPhone(phone),
      }).eq("user_id", user.id);
    }
    toast({ title: "Account created!" });
    if (user) await redirectByRole(user.id, navigate);
    else navigate("/");
    setLoading(false);
  };

  // ── Forgot Password ──
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (method === "email") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reset link sent!", description: "Check your email for a password reset link." });
      }
    } else {
      const formatted = formatPhone(phone);
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (error) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "OTP Sent!" });
        setStep("forgot_otp");
      }
    }
    setLoading(false);
  };

  // ── Forgot OTP Verify ──
  const handleForgotOtpVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: "sms",
    });
    if (error) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } else {
      setStep("new_password");
    }
    setLoading(false);
  };

  // ── Set New Password ──
  const handleNewPassword = async (e: React.FormEvent) => {
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
      toast({ title: "Password updated!" });
      navigate("/");
    }
    setLoading(false);
  };

  const inputClass = "bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl h-12";

  const getTitle = () => {
    if (step === "phone_otp" || step === "forgot_otp") return "Verify OTP";
    if (step === "email_otp") return "Verify Email";
    if (step === "create_account") return "Create Account";
    if (step === "new_password") return "New Password";
    if (mode === "forgot_password") return "Reset Password";
    return mode === "login" ? "Welcome Back" : "Create Account";
  };

  const getSubtitle = () => {
    if (step === "phone_otp") return `Enter the 6-digit code sent to ${formatPhone(phone)}`;
    if (step === "forgot_otp") return `Enter the code sent to ${formatPhone(phone)}`;
    if (step === "email_otp") return "Confirm your email before signing in — we sent you a verification link.";
    if (step === "create_account") return "Complete your profile";
    if (step === "new_password") return "Choose a new password";
    if (mode === "forgot_password") return `Enter your ${method === "email" ? "email" : "phone"} to reset password`;
    return mode === "login" ? "Sign in to continue" : "Join us today";
  };

  // ── Method Toggle ──
  const MethodToggle = () => (
    <div className="flex rounded-xl bg-muted p-1 mb-6">
      <button
        type="button"
        onClick={() => { setMethod("email"); resetAll(); }}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
          method === "email" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Mail className="w-4 h-4" /> Email
      </button>
      <button
        type="button"
        onClick={() => { setMethod("phone"); resetAll(); }}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
          method === "phone" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Phone className="w-4 h-4" /> Phone
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => step !== "credentials" ? resetAll() : navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step !== "credentials" ? "Back" : "Home"}
        </button>

        <div className="glass-card rounded-3xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              Try<span className="gradient-gold-text">vior</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-1">{getTitle()}</h1>
          <p className="text-sm text-muted-foreground mb-6">{getSubtitle()}</p>

          {/* ── Credentials Step (Login / Signup) ── */}
          {step === "credentials" && mode !== "forgot_password" && (
            <>
              <MethodToggle />

              {/* Email Login */}
              {mode === "login" && method === "email" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputClass} pl-10 pr-12`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <button type="button" onClick={() => switchMode("forgot_password")} className="w-full text-center text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>
                </form>
              )}

              {/* Email Signup */}
              {mode === "signup" && method === "email" && (
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Password</label>
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
                    {loading ? "Creating..." : "Sign Up"}
                  </Button>
                </form>
              )}

              {method === "phone" && (
                <div className="rounded-xl border border-border bg-muted/50 p-3 mb-4">
                  <p className="text-xs text-muted-foreground">
                    SMS OTP is not active on this project yet. Use email or Google to continue — phone
                    codes will start working as soon as an SMS sender is configured.
                  </p>
                </div>
              )}

              {/* Phone Login / Signup — send OTP */}
              {method === "phone" && (
                <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label className="text-sm text-foreground/80 mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} pl-10`} />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="tel" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                  {mode === "login" && (
                    <button type="button" onClick={() => switchMode("forgot_password")} className="w-full text-center text-sm text-primary hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </form>
              )}

              {/* Google OAuth */}
              <div className="flex items-center gap-3 my-5">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.2-3.2-.5-4.7H24v9.1h12.6c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.5z"/>
                  <path fill="#FBBC05" d="M10.4 28.7A14.7 14.7 0 0 1 9.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.9l-7.6-5.9c-2.1 1.4-4.9 2.3-8.2 2.3-6.4 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Toggle Login / Signup */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>Don't have an account?{" "}
                    <button onClick={() => switchMode("signup")} className="text-primary font-medium hover:underline">Sign Up</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button onClick={() => switchMode("login")} className="text-primary font-medium hover:underline">Sign In</button>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── Forgot Password Input ── */}
          {step === "credentials" && mode === "forgot_password" && (
            <>
              <MethodToggle />
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                {method === "email" ? (
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" placeholder="Your registered email" value={email} onChange={(e) => setEmail(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-foreground/80 mb-1.5 block">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="tel" placeholder="Your registered number" value={phone} onChange={(e) => setPhone(e.target.value)} required className={`${inputClass} pl-10`} />
                    </div>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand">
                  {loading ? "Sending..." : method === "email" ? "Send Reset Link" : "Send OTP"}
                </Button>
              </form>
              <button onClick={() => switchMode("login")} className="w-full text-center text-sm text-primary hover:underline mt-4">
                Back to Sign In
              </button>
            </>
          )}

          {/* ── OTP Verification ── */}
          {(step === "phone_otp" || step === "forgot_otp") && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={step === "phone_otp" ? handlePhoneVerifyOtp : handleForgotOtpVerify}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base hover:scale-[1.02] transition-transform shadow-brand"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                onClick={() => { setOtp(""); handlePhoneSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* ── Email Verification Sent ── */}
          {step === "email_otp" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Click the link in your email to verify, then sign in.</p>
              <Button onClick={() => switchMode("login")} className="w-full h-12 bg-gradient-hero text-white font-semibold rounded-xl border-0 text-base">
                Go to Sign In
              </Button>
            </div>
          )}

          {/* ── Create Account (after phone OTP) ── */}
          {step === "create_account" && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-sm text-foreground/80 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground/80 mb-1.5 block">Password</label>
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
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          )}

          {/* ── New Password (after reset) ── */}
          {step === "new_password" && (
            <form onSubmit={handleNewPassword} className="space-y-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
