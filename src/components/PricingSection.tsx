import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const plans = [
  {
    icon: Zap, name: "Starter", price: "₹2,999", period: "/month",
    description: "Perfect for small boutiques and sellers",
    features: ["Up to 500 try-ons/month", "50 product catalog", "Basic body detection", "WhatsApp integration", "Email support"],
    cta: "Get Started", highlighted: false,
  },
  {
    icon: Crown, name: "Growth", price: "₹9,999", period: "/month",
    description: "For growing fashion brands scaling online",
    features: ["Up to 5,000 try-ons/month", "Unlimited catalog", "3D try-on visualization", "Shopify & Meesho integration", "Mix & match feature", "Priority support"],
    cta: "Start Free Trial", highlighted: true,
  },
  {
    icon: Building2, name: "Enterprise", price: "Custom", period: "",
    description: "For large brands & fashion platforms",
    features: ["Unlimited try-ons", "Full API access", "Custom AI model training", "Amazon & Flipkart integration", "Data insights dashboard", "Dedicated account manager"],
    cta: "Contact Sales", highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.06), transparent)" }} />
      <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full blur-[120px] pointer-events-none" style={{ background: "hsl(var(--hero-accent) / 0.04)" }} />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-mint mb-5 inline-flex">Pricing Plans</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-lg mx-auto">
            Start free. Scale as you grow. No hidden charges.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto" style={{ perspective: 1200 }}>
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 70 }}
            >
              <motion.div
                className={`relative rounded-2xl p-6 flex flex-col h-full ${
                  plan.highlighted
                    ? "animate-glow-border"
                    : "glass-card"
                }`}
                style={plan.highlighted ? {
                  background: "linear-gradient(145deg, hsl(260 30% 15%), hsl(240 25% 10%))",
                  border: "1px solid hsl(var(--hero-accent) / 0.3)",
                } : undefined}
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 24px 60px hsl(var(--hero-accent) / 0.15)" }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                
              >
                {plan.highlighted && (
                  <motion.div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-body font-semibold tracking-wide whitespace-nowrap"
                    style={{
                      background: "var(--gradient-hero-accent)",
                      color: "hsl(0 0% 100%)",
                      boxShadow: "0 0 20px hsl(var(--hero-accent) / 0.4)",
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    Most Popular
                  </motion.div>
                )}

                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: "hsl(var(--hero-accent) / 0.1)" }}>
                  <plan.icon className="w-5 h-5" style={{ color: "hsl(var(--hero-accent))" }} />
                </div>

                <p className="font-body text-xs font-semibold tracking-widest uppercase mb-1 text-muted-foreground">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="font-body text-sm mb-0.5 text-muted-foreground">{plan.period}</span>
                </div>
                <p className="font-body text-xs mb-6 leading-relaxed text-muted-foreground">{plan.description}</p>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "hsl(var(--hero-accent) / 0.15)" }}>
                        <Check className="w-2.5 h-2.5" style={{ color: "hsl(var(--hero-accent))" }} />
                      </div>
                      <span className="font-body text-xs leading-relaxed text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    className="w-full rounded-full font-body font-medium py-4 text-sm transition-all border-0"
                    style={plan.highlighted ? {
                      background: "var(--gradient-hero-accent)",
                      color: "hsl(0 0% 100%)",
                      boxShadow: "0 0 20px hsl(var(--hero-accent) / 0.3)",
                    } : {
                      background: "hsl(0 0% 100% / 0.06)",
                      color: "hsl(0 0% 80%)",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
                    }}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
