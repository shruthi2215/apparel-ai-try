import { Sparkles, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="py-14 relative overflow-hidden" style={{ background: "hsl(240 20% 3%)", borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}>
      <motion.div
        className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[150px] pointer-events-none"
        style={{ background: "hsl(var(--hero-accent) / 0.04)" }}
        animate={{ x: [0, 40, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center shadow-gold">
                <Sparkles className="w-4 h-4" style={{ color: "hsl(0 0% 100%)" }} />
              </div>
              <span className="font-display text-xl font-semibold" style={{ color: "hsl(0 0% 95%)" }}>
                Try On <span className="gradient-text">Me</span>
              </span>
            </motion.div>
            <p className="font-body text-sm leading-relaxed mb-5 text-pretty" style={{ color: "hsl(0 0% 100% / 0.35)" }}>
              AI virtual try-on platform. Transforming online fashion shopping with next-gen technology.
            </p>
            <div className="flex items-center gap-2.5">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ border: "1px solid hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.3)" }}
                  whileHover={{ scale: 1.15, y: -2, borderColor: "hsl(var(--hero-accent) / 0.4)", color: "hsl(var(--hero-accent))" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Virtual Try-On", "Body Detection", "3D Viewer", "Mix & Match", "Mobile App"] },
            { title: "For Business", links: ["Brand Integration", "API Docs", "Shopify Plugin", "Pricing", "Enterprise"] },
            { title: "Company", links: ["About Us", "Blog", "Press", "Careers", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-body font-medium text-xs mb-4 tracking-widest uppercase" style={{ color: "hsl(0 0% 100% / 0.5)" }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="font-body text-sm inline-block transition-colors"
                      style={{ color: "hsl(0 0% 100% / 0.3)" }}
                      whileHover={{ x: 3, color: "hsl(0 0% 100% / 0.7)" }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-7" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.05)" }}>
          <p className="font-body text-xs" style={{ color: "hsl(0 0% 100% / 0.2)" }}>
            © 2024 Try On Me. All rights reserved. Made with ♥ in India.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="font-body text-xs transition-colors" style={{ color: "hsl(0 0% 100% / 0.2)" }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
