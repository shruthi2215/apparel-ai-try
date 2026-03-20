import { Camera, Scan, Sparkles, ShoppingBag } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Upload Your Photo",
    description: "Take a front-facing photo or upload from your gallery. Clear lighting works best.",
    bg: "bg-blush",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Body Scan",
    description: "Our AI maps your body measurements in seconds — height, build, and proportions.",
    bg: "bg-lavender",
    iconBg: "bg-gold/15",
    iconColor: "text-gold-dark",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Virtual Try-On",
    description: "Browse thousands of styles. See them draped on your body with realistic AI visualization.",
    bg: "bg-mint",
    iconBg: "bg-accent/20",
    iconColor: "text-accent-foreground",
  },
  {
    number: "04",
    icon: ShoppingBag,
    title: "Buy with Confidence",
    description: "Know your perfect size and style before checkout. Fewer returns, more smiles.",
    bg: "card-blush",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="pill-mint mb-5 inline-flex">How It Works</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            Try On in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="font-body text-muted-foreground text-base max-w-xl mx-auto text-pretty">
            From photo to perfect fit in under 30 seconds. No measuring tape needed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative group"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="bg-white rounded-[14px] p-5 border border-border hover:border-primary/25 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                  <span className="font-display text-3xl font-light text-border/70 leading-none">{step.number}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
                <p className="font-body text-muted-foreground text-xs leading-relaxed text-pretty">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-muted items-center justify-center border border-border">
                  <span className="text-muted-foreground text-[9px]">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
