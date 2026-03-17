import { Camera, Scan, Sparkles, ShoppingBag } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Upload Your Photo",
    description: "Take a front-facing photo or upload one from your gallery. Our AI does the rest.",
    color: "text-primary",
    bg: "bg-secondary",
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Body Scan",
    description: "Our AI maps your body measurements in seconds — height, build, and proportions.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Virtual Try-On",
    description: "Browse thousands of styles. See them on your body in real time with 3D visualization.",
    color: "text-primary-glow",
    bg: "bg-primary/10",
  },
  {
    number: "04",
    icon: ShoppingBag,
    title: "Buy with Confidence",
    description: "Know your perfect size and style before checking out. Fewer returns, more smiles.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-body font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            How It Works
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Try On in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
            From photo to perfect fit in under 30 seconds. No measuring tape needed.
          </p>
        </div>

          <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative group"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Card */}
                <div className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-brand hover:-translate-y-1 h-full">
                  {/* Number */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <span className="font-display text-4xl font-bold text-border">{step.number}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="font-body text-muted-foreground text-xs leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-secondary items-center justify-center border border-border">
                    <span className="text-muted-foreground text-[10px]">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
