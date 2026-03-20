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
    cardClass: "bg-white border-border",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    checkBg: "bg-primary/10",
    checkColor: "text-primary",
    btnClass: "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border-0",
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
    cardClass: "bg-gradient-hero border-0 text-white",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    checkBg: "bg-white/20",
    checkColor: "text-white",
    btnClass: "bg-white text-primary hover:bg-gold-light hover:text-gold-dark border-0",
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
    cardClass: "bg-white border-border",
    iconBg: "bg-gold/12",
    iconColor: "text-gold-dark",
    checkBg: "bg-gold/10",
    checkColor: "text-gold-dark",
    btnClass: "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border-0",
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -top-16 right-1/4 w-56 h-56 rounded-full bg-gold/6 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="pill-mint mb-5 inline-flex">Pricing Plans</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            Simple, Transparent<br />
            <span className="gradient-text">Pricing for Every Brand</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-lg mx-auto">
            Start free. Scale as you grow. No hidden charges.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-[14px] p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 border ${plan.cardClass} ${plan.highlighted ? "shadow-lg" : "shadow-soft hover:shadow-md"}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold rounded-full text-white text-xs font-body font-semibold tracking-wide whitespace-nowrap shadow-gold">
                  Most Popular
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${plan.iconBg}`}>
                <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
              </div>

              <p className={`font-body text-xs font-semibold tracking-widest uppercase mb-1 ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1 mb-2">
                <span className={`font-display text-3xl font-medium ${plan.highlighted ? "text-white" : "text-foreground"}`}>
                  {plan.price}
                </span>
                <span className={`font-body text-sm mb-0.5 ${plan.highlighted ? "text-white/60" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`font-body text-xs mb-6 leading-relaxed ${plan.highlighted ? "text-white/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.checkBg}`}>
                      <Check className={`w-2.5 h-2.5 ${plan.checkColor}`} />
                    </div>
                    <span className={`font-body text-xs leading-relaxed ${plan.highlighted ? "text-white/80" : "text-foreground/75"}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button className={`w-full rounded-full font-body font-medium py-4 text-sm transition-all ${plan.btnClass}`}>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
