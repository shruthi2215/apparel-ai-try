import bodyScanImage from "@/assets/body-scan.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Globe } from "lucide-react";

const roadmap = [
  {
    phase: "6 Months",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/15",
    items: ["Launch MVP", "Partner with 20 brands", "Reach 50k users"],
  },
  {
    phase: "1 Year",
    icon: Users,
    color: "text-gold",
    bg: "bg-gold/15",
    items: ["200k active users", "100+ fashion brands", "Expand across India"],
  },
  {
    phase: "3 Years",
    icon: Globe,
    color: "text-primary-glow",
    bg: "bg-primary-glow/15",
    items: ["5M+ users", "Global partnerships", "Full AI fashion ecosystem"],
  },
];

export default function GrowthSection() {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Growth Roadmap */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-body font-semibold tracking-[0.2em] uppercase text-primary mb-4">
            Growth Roadmap
          </span>
          <h2 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6">
            From Launch to<br />
            <span className="gradient-text">5 Million Users</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-28">
          {roadmap.map((phase, i) => (
            <div key={i} className="relative">
              {/* Connector */}
              {i < roadmap.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-4 z-10 text-muted-foreground">→</div>
              )}
              <div className="bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-all hover:shadow-brand h-full">
                <div className={`w-14 h-14 rounded-2xl ${phase.bg} flex items-center justify-center mb-6`}>
                  <phase.icon className={`w-7 h-7 ${phase.color}`} />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">{phase.phase}</h3>
                <ul className="space-y-3">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 font-body text-muted-foreground text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${phase.color.replace("text-", "bg-")}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <img src={bodyScanImage} alt="AI body scan visualization" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          </div>

          <div className="relative z-10 px-12 py-20 text-center">
            <p className="font-body text-white/70 text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Join the Revolution
            </p>
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              India's Future of<br />Fashion is Here.
            </h2>
            <p className="font-body text-white/70 text-lg max-w-lg mx-auto mb-10">
              Be among the first brands to offer AI virtual try-on. Boost conversions. Cut returns. Delight customers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-primary font-body font-semibold px-8 py-6 text-base rounded-full hover:bg-gold hover:text-dark-bg transition-all shadow-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/15 px-8 py-6 text-base rounded-full">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
