import { Brain, Ruler, Palette, Sparkles, Smartphone, Link2 } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Smart Fit Detection",
    description: "AI detects your exact measurements from a single photo. Recommends the right size every time.",
    tag: "AI",
  },
  {
    icon: Palette,
    title: "Skin Tone Matching",
    description: "Our algorithm matches outfit colors to your skin tone, ensuring every look complements you perfectly.",
    tag: "Smart",
  },
  {
    icon: Sparkles,
    title: "Personalized Recommendations",
    description: "Get AI-curated outfit suggestions based on your body type, style preferences, and trending looks.",
    tag: "Personal",
  },
  {
    icon: Ruler,
    title: "3D Clothing View",
    description: "Rotate, zoom and preview garments in full 3D. See how a saree drapes or a shirt fits.",
    tag: "3D",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for mobile-first shoppers. Smooth experience on any Android or iPhone.",
    tag: "Mobile",
  },
  {
    icon: Link2,
    title: "E-Commerce Integration",
    description: "Plug into any e-commerce platform with one line of code. Shopify, WooCommerce, and more.",
    tag: "B2B",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none" style={{ background: "hsl(var(--hero-accent) / 0.05)" }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none" style={{ background: "hsl(190 90% 55% / 0.04)" }} />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-mint mb-5 inline-flex">AI Features</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Powered by <span className="gradient-text">Intelligent AI</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-xl mx-auto text-pretty">
            Advanced features that make virtual try-on feel real.
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
                className="group glass-card rounded-2xl p-6 cursor-default h-full"
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: "0 20px 50px hsl(var(--hero-accent) / 0.15)",
                  borderColor: "hsl(var(--hero-accent) / 0.25)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "hsl(var(--hero-accent) / 0.1)" }}
                    whileHover={{ rotate: -10, scale: 1.15 }}
                  >
                    <feat.icon className="w-5 h-5" style={{ color: "hsl(var(--hero-accent))" }} />
                  </motion.div>
                  <span className="pill-lavender text-[10px]">{feat.tag}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">{feat.title}</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed text-pretty">{feat.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
