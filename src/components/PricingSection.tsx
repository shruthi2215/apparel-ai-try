import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    icon: Zap,
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    description: "Perfect for small boutiques and WhatsApp sellers",
    features: [
      "Up to 500 try-ons/month",
      "50 product catalog",
      "Basic body detection",
      "WhatsApp integration",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    icon: Crown,
    name: "Growth",
    price: "₹9,999",
    period: "/month",
    description: "For growing fashion brands scaling online",
    features: [
      "Up to 5,000 try-ons/month",
      "Unlimited catalog",
      "3D try-on visualization",
      "Shopify & Meesho integration",
      "Mix & match feature",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    icon: Building2,
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large brands, marketplaces & fashion platforms",
    features: [
      "Unlimited try-ons",
      "Full API access",
      "Custom AI model training",
      "Amazon & Flipkart integration",
      "Data insights dashboard",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-28 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full bg-primary/15 blur-[80px]" />
      <div className="absolute -top-20 right-1/4 w-60 h-60 rounded-full bg-gold/10 blur-[60px]" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-body font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            Pricing Plans
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6">
            Simple, Transparent<br />
            <span className="gradient-text">Pricing for Every Brand</span>
          </h2>
          <p className="font-body text-white/50 text-lg max-w-xl mx-auto">
            Start free. Scale as you grow. No hidden charges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1
                ${plan.highlighted
                  ? "bg-gradient-hero border-0 shadow-lg"
                  : "glass-card hover:border-primary/40"
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gold rounded-full text-dark-bg text-xs font-body font-bold tracking-wide whitespace-nowrap shadow-gold">
                  Most Popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.highlighted ? "bg-white/20" : "bg-primary/20"}`}>
                <plan.icon className={`w-6 h-6 ${plan.highlighted ? "text-white" : "text-primary"}`} />
              </div>

              <p className={`font-body text-sm font-semibold tracking-wide mb-1 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1 mb-3">
                <span className={`font-display text-4xl font-bold ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                  {plan.price}
                </span>
                <span className={`font-body text-sm mb-1 ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`font-body text-sm mb-8 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlighted ? "bg-white/20" : "bg-primary/15"}`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-primary"}`} />
                    </div>
                    <span className={`font-body text-sm ${plan.highlighted ? "text-white/80" : "text-foreground/80"}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full font-body font-semibold py-5 transition-all
                  ${plan.highlighted
                    ? "bg-white text-primary hover:bg-gold hover:text-dark-bg"
                    : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
