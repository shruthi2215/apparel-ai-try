import { Sparkles, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-white/8 py-14">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-medium text-white">
                Try On <span className="gradient-gold-text">Me</span>
              </span>
            </div>
            <p className="font-body text-white/40 text-sm leading-relaxed mb-5 text-pretty">
              India's leading AI virtual try-on platform. Transforming online fashion shopping since 2024.
            </p>
            <div className="flex items-center gap-2.5">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/12 flex items-center justify-center text-white/35 hover:text-primary hover:border-primary/40 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
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
              <h4 className="font-body font-medium text-white/60 text-xs mb-4 tracking-widest uppercase">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-white/35 text-sm hover:text-white/70 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-7 border-t border-white/8">
          <p className="font-body text-white/25 text-xs">
            © 2024 Try On Me. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="font-body text-white/25 text-xs hover:text-white/55 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
