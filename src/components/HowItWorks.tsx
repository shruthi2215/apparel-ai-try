import { Camera, Scan, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { number: "01", icon: Camera, title: "Upload Your Photo", description: "Take a front-facing photo or upload from your gallery. Clear lighting works best.", iconBg: "bg-primary/12", iconColor: "text-primary" },
  { number: "02", icon: Scan, title: "AI Body Scan", description: "Our AI maps your body measurements in seconds — height, build, and proportions.", iconBg: "bg-gold/15", iconColor: "text-gold-dark" },
  { number: "03", icon: Sparkles, title: "Virtual Try-On", description: "Browse thousands of styles. See them draped on your body with realistic AI visualization.", iconBg: "bg-accent/20", iconColor: "text-accent-foreground" },
  { number: "04", icon: ShoppingBag, title: "Buy with Confidence", description: "Know your perfect size and style before checkout. Fewer returns, more smiles.", iconBg: "bg-primary/10", iconColor: "text-primary" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 80 },
  }),
};

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-mint mb-5 inline-flex">How It Works</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            Try On in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-xl mx-auto text-pretty">
            From photo to perfect fit in under 30 seconds. No measuring tape needed.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ perspective: 1000 }}>
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
                className="bg-white/80 backdrop-blur-md rounded-[14px] p-5 border border-white/40 shadow-sm h-full"
                whileHover={{ y: -6, rotateY: -3, scale: 1.02, boxShadow: "0 16px 40px hsl(240 10% 40% / 0.12)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </motion.div>
                  <span className="font-display text-3xl font-light text-border/70 leading-none">{step.number}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed text-pretty">{step.description}</p>
              </motion.div>

              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-muted items-center justify-center border border-border">
                  <span className="text-muted-foreground text-[9px]">→</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
