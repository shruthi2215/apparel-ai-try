import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = ["Features", "How It Works", "Pricing", "About"];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Try On <span className="gradient-gold-text">Me</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="font-body text-sm text-white/60 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="font-body text-white/70 hover:text-white hover:bg-white/10 text-sm">
              Sign In
            </Button>
            <Button className="bg-gradient-hero text-white font-body font-semibold text-sm px-5 py-2 rounded-full border-0 hover:scale-105 transition-transform shadow-brand">
              Get Started
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-2 glass-card rounded-2xl px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="font-body text-sm text-white/70 hover:text-white py-2 border-b border-white/10"
                onClick={() => setOpen(false)}
              >
                {link}
              </a>
            ))}
            <Button className="bg-gradient-hero text-white font-body font-semibold rounded-full border-0 mt-2">
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
