import { Sparkles, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-white/10 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Try On <span className="gradient-gold-text">Me</span>
              </span>
            </div>
            <p className="font-body text-white/40 text-sm leading-relaxed mb-6">
              India's leading AI virtual try-on platform. Transforming online fashion shopping since 2024.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: ["Virtual Try-On", "Body Detection", "3D Viewer", "Mix & Match", "Mobile App"],
            },
            {
              title: "For Business",
              links: ["Brand Integration", "API Docs", "Shopify Plugin", "Pricing", "Enterprise"],
            },
            {
              title: "Company",
              links: ["About Us", "Blog", "Press", "Careers", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-body font-semibold text-white text-sm mb-5 tracking-wider uppercase">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-white/40 text-sm hover:text-white/80 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="font-body text-white/30 text-sm">
            © 2024 Try On Me. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="font-body text-white/30 text-xs hover:text-white/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
