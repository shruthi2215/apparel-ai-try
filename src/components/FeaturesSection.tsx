import { Brain, Ruler, Box, Shuffle, Smartphone, Link2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Brain, title: "AI Virtual Try-On", description: "Photorealistic AI drapes any outfit onto your photo. No guessing, no disappointment.", tag: "Core", tagClass: "pill-blush", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: Ruler, title: "Smart Body Detection", description: "AI detects your exact measurements from a single photo. Recommends the right size every time.", tag: "Precision", tagClass: "pill-lavender", iconBg: "bg-primary-glow/12", iconColor: "text-primary-glow" },
  { icon: Box, title: "3D Clothing View", description: "Rotate, zoom and preview garments in full 3D. See how a saree drapes or a shirt fits.", tag: "3D", tagClass: "pill-mint", iconBg: "bg-accent/15", iconColor: "text-accent-foreground" },
  { icon: Shuffle, title: "Mix & Match Outfits", description: "Combine tops, bottoms, dupattas, and accessories. Build complete looks in seconds.", tag: "Creative", tagClass: "pill-blush", iconBg: "bg-gold/12", iconColor: "text-gold-dark" },
  { icon: Smartphone, title: "Mobile First", description: "Designed for India's mobile-first shoppers. Smooth on any Android or iPhone.", tag: "Mobile", tagClass: "pill-mint", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { icon: Link2, title: "E-Commerce Integration", description: "Plug into Amazon, Flipkart, Shopify, or your WhatsApp store with one line of code.", tag: "B2B", tagClass: "pill-lavender", iconBg: "bg-primary-glow/12", iconColor: "text-primary-glow" },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gold/6 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-lavender mb-5 inline-flex">Platform Features</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            Everything You Need to<br />
            <span className="gradient-text">Sell More, Return Less</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-xl mx-auto text-pretty">
            Powerful AI features built specifically for India's fashion market.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ perspective: 1200 }}>
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 80 }}
            >
              <motion.div
                className="group bg-white/80 backdrop-blur-md rounded-[14px] p-5 border border-white/40 shadow-sm cursor-default h-full"
                whileHover={{ y: -6, rotateY: 4, scale: 1.02, boxShadow: "0 20px 50px hsl(240 10% 40% / 0.12)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center`}
                    whileHover={{ rotate: -10, scale: 1.15 }}
                  >
                    <feat.icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </motion.div>
                  <span className={feat.tagClass}>{feat.tag}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1.5 leading-snug">{feat.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed text-pretty">{feat.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
