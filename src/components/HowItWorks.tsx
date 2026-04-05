import { Upload, Shirt, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Photo",
    description: "Take a selfie or upload from your gallery. Clear lighting works best.",
  },
  {
    number: "02",
    icon: Shirt,
    title: "Choose an Outfit",
    description: "Browse thousands of styles — sarees, kurtis, dresses, and more.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "AI Generates Your Look",
    description: "See exactly how the outfit looks on your body in under 5 seconds.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 80 },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Ambient blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/8 blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-mint mb-5 inline-flex">How It Works</span>
          <h2 className="font-display text-3xl md:text-5xl font-medium text-foreground mb-4">
            Three Steps. <span className="gradient-text">That's It.</span>
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            From photo to perfect look in under 30 seconds.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative group"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <motion.div
                className="glass-card rounded-2xl p-7 h-full text-center"
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  boxShadow: "0 20px 50px hsl(var(--hero-accent) / 0.1)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                {/* Step number */}
                <span className="font-display text-5xl font-light text-border/50 leading-none block mb-4">
                  {step.number}
                </span>

                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: "hsl(var(--hero-accent) / 0.1)",
                  }}
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                  <step.icon
                    className="w-6 h-6"
                    style={{ color: "hsl(var(--hero-accent))" }}
                  />
                </motion.div>

                {/* Text */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>

              {/* Connector arrow (between cards) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-muted items-center justify-center border border-border">
                  <span className="text-muted-foreground text-xs">→</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
