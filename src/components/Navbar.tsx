import { Sparkles, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Products", href: "/products" },
  { label: "Virtual Try-On", href: "/try-on" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isSuperAdmin, isAdmin } = useAuth();

  const handleNav = (href: string) => { navigate(href); setOpen(false); };
  const handleSignOut = async () => { await signOut(); navigate("/"); setOpen(false); };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 py-3"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm"
          style={{ backdropFilter: "blur(20px) saturate(1.8)" }}
        >
          {/* Logo */}
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Try On <span className="gradient-gold-text">Me</span>
            </span>
          </motion.button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <motion.button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className={`font-body text-sm transition-colors relative ${
                  location.pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileHover={{ y: -1 }}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="font-body text-muted-foreground hover:text-foreground text-sm gap-2 h-9"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-semibold">
                    {(profile?.display_name || user.email || "U")[0].toUpperCase()}
                  </div>
                  {profile?.display_name?.split(" ")[0] || "Profile"}
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/try-on")}
                    className="bg-primary text-primary-foreground font-body text-sm px-5 h-9 rounded-full border-0 hover:bg-primary/90 transition-all shadow-soft"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Try On Now
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="font-body text-muted-foreground hover:text-foreground text-sm h-9"
                >
                  Sign In
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => navigate("/auth")}
                    className="bg-primary text-primary-foreground font-body text-sm px-5 h-9 rounded-full border-0 hover:bg-primary/90 transition-all shadow-soft"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground p-1" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="md:hidden mt-2 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl px-5 py-5 flex flex-col gap-1 shadow-md overflow-hidden"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.href)}
                  className="font-body text-sm text-muted-foreground hover:text-foreground py-2.5 border-b border-border text-left last:border-0"
                >
                  {link.label}
                </button>
              ))}
              {user ? (
                <>
                  <button
                    onClick={() => handleNav("/profile")}
                    className="font-body text-sm text-muted-foreground hover:text-foreground py-2.5 border-b border-border text-left flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  {profile?.is_admin && (
                    <button
                      onClick={() => handleNav("/admin")}
                      className="font-body text-sm text-muted-foreground hover:text-foreground py-2.5 border-b border-border text-left"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => handleNav("/super-admin")}
                      className="font-body text-sm text-muted-foreground hover:text-foreground py-2.5 border-b border-border text-left"
                    >
                      Super Admin Console
                    </button>
                  )}
                  <Button
                    onClick={() => navigate("/try-on")}
                    className="bg-primary text-primary-foreground font-body rounded-full border-0 mt-3"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Try On Now
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="font-body text-muted-foreground hover:text-foreground"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => handleNav("/auth")}
                  className="bg-primary text-primary-foreground font-body rounded-full border-0 mt-3"
                >
                  Get Started Free
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
