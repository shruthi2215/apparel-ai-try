import { Brain, Ruler, Box, Shuffle, Smartphone, Link2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Virtual Try-On",
    description: "Photorealistic AI drapes any outfit onto your photo — no guessing, no disappointment.",
    tag: "Core",
  },
  {
    icon: Ruler,
    title: "Smart Body Detection",
    description: "AI detects your exact measurements from a single photo. Recommends the right size every time.",
    tag: "Precision",
  },
  {
    icon: Box,
    title: "3D Clothing View",
    description: "Rotate, zoom and preview garments in full 3D. See how a saree drapes or a shirt fits.",
    tag: "3D",
  },
  {
    icon: Shuffle,
    title: "Mix & Match Outfits",
    description: "Combine tops, bottoms, dupattas, and accessories. Build complete looks in seconds.",
    tag: "Creative",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Designed for India's mobile-first shoppers. Smooth on any Android or iPhone.",
    tag: "Mobile",
  },
  {
    icon: Link2,
    title: "E-Commerce Integration",
    description: "Plug into Amazon, Flipkart, Shopify, or your WhatsApp store with one line of code.",
    tag: "B2B",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 bg-dark-bg relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/15 blur-[80px]" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-body font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Platform Features
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything You Need to<br />
            <span className="gradient-text">Sell More, Return Less</span>
          </h2>
          <p className="font-body text-white/50 text-lg max-w-2xl mx-auto">
            Powerful AI features built specifically for India's fashion market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <div
              key={i}
              className="group glass-card rounded-2xl p-5 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <feat.icon className="w-5 h-5 text-primary group-hover:text-primary-glow transition-colors" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-body font-semibold tracking-wide">
                  {feat.tag}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-1.5">{feat.title}</h3>
              <p className="font-body text-white/50 text-xs leading-relaxed">{feat.description}</p>

              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
