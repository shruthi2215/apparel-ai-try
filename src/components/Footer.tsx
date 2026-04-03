import { Sparkles, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-white/8 py-14 relative overflow-hidden">
      {/* Subtle animated glow */}
      <motion.div
        className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
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
              <div className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-medium text-white">
                Try On <span className="gradient-gold-text">Me</span>
              </span>
            </motion.div>
            <p className="font-body text-white/40 text-sm leading-relaxed mb-5 text-pretty">
              India's leading AI virtual try-on platform. Transforming online fashion shopping since 2024.
            </p>
            <div className="flex items-center gap-2.5">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/12 flex items-center justify-center text-white/35 hover:text-primary hover:border-primary/40 transition-all"
                  whileHover={{ scale: 1.15, y: -2 }}
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
              <h4 className="font-body font-medium text-white/60 text-xs mb-4 tracking-widest uppercase">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="font-body text-white/35 text-sm hover:text-white/70 transition-colors inline-block"
                      whileHover={{ x: 3 }}
                    >
                      {link}
                    </motion.a>
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
