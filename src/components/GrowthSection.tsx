import bodyScanImage from "@/assets/body-scan.jpg";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Globe } from "lucide-react";

const roadmap = [
  {
    phase: "6 Months",
    icon: TrendingUp,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    items: ["Launch MVP", "Partner with 20 brands", "Reach 50k users"],
  },
  {
    phase: "1 Year",
    icon: Users,
    iconBg: "bg-gold/12",
    iconColor: "text-gold-dark",
    items: ["200k active users", "100+ fashion brands", "Expand across India"],
  },
  {
    phase: "3 Years",
    icon: Globe,
    iconBg: "bg-accent/18",
    iconColor: "text-accent-foreground",
    items: ["5M+ users", "Global partnerships", "Full AI fashion ecosystem"],
  },
];

export default function GrowthSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-gold/6 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Growth Roadmap */}
        <div className="text-center mb-14">
          <span className="pill-lavender mb-5 inline-flex">Growth Roadmap</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            From Launch to<br />
            <span className="gradient-text">5 Million Users</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-24">
          {roadmap.map((phase, i) => (
            <div key={i} className="relative">
              {i < roadmap.length - 1 && (
                <div className="hidden md:block absolute top-9 -right-3 z-10 text-muted-foreground text-sm">→</div>
              )}
              <div className="bg-white rounded-[14px] p-6 border border-border hover:border-primary/20 transition-all hover:shadow-md h-full">
                <div className={`w-12 h-12 rounded-xl ${phase.iconBg} flex items-center justify-center mb-5`}>
                  <phase.icon className={`w-6 h-6 ${phase.iconColor}`} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{phase.phase}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 font-body text-muted-foreground text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${phase.iconColor.replace("text-", "bg-")}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner — soft overlay approach */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-soft border border-border shadow-soft">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
          </div>

          <div className="relative z-10 px-10 py-16 text-center">
            <span className="pill-blush mb-5 inline-flex">Join the Revolution</span>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance leading-tight">
              India's Future of Fashion is Here.
            </h2>
            <p className="font-body text-muted-foreground text-base max-w-lg mx-auto mb-8 text-pretty">
              Be among the first brands to offer AI virtual try-on. Boost conversions. Cut returns. Delight customers.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-primary text-primary-foreground font-body font-medium px-7 h-11 text-sm rounded-full hover:bg-primary/90 transition-all shadow-soft border-0">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-border text-foreground bg-white/70 hover:bg-white px-7 h-11 text-sm rounded-full font-body">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
