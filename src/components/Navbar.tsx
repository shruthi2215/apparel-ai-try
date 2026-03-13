import { Sparkles, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Browse Products", href: "/products" },
  { label: "Virtual Try-On", href: "/try-on" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const handleNav = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Try On <span className="gradient-gold-text">Me</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className={`font-body text-sm transition-colors ${
                  location.pathname === link.href
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="font-body text-muted-foreground hover:text-foreground hover:bg-white/10 text-sm gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold">
                    {(profile?.display_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  {profile?.display_name?.split(" ")[0] || "Profile"}
                </Button>
                <Button
                  onClick={() => navigate("/try-on")}
                  className="bg-gradient-hero text-white font-body font-semibold text-sm px-5 py-2 rounded-full border-0 hover:scale-105 transition-transform shadow-brand"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Try On Now
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="font-body text-muted-foreground hover:text-foreground hover:bg-white/10 text-sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-hero text-white font-body font-semibold text-sm px-5 py-2 rounded-full border-0 hover:scale-105 transition-transform shadow-brand"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 glass-card rounded-2xl px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="font-body text-sm text-muted-foreground hover:text-foreground py-2 border-b border-white/10 text-left"
              >
                {link.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => handleNav("/profile")}
                  className="font-body text-sm text-muted-foreground hover:text-foreground py-2 border-b border-white/10 text-left flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> My Profile
                </button>
                {profile?.is_admin && (
                  <button
                    onClick={() => handleNav("/admin")}
                    className="font-body text-sm text-muted-foreground hover:text-foreground py-2 border-b border-white/10 text-left"
                  >
                    Admin Dashboard
                  </button>
                )}
                <Button
                  onClick={() => navigate("/try-on")}
                  className="bg-gradient-hero text-white font-body font-semibold rounded-full border-0 mt-2"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Try On Now
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="font-body text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleNav("/auth")}
                  className="bg-gradient-hero text-white font-body font-semibold rounded-full border-0 mt-2"
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
