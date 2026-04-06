import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

const roadmap = [
  { phase: "6 Months", icon: TrendingUp, iconBg: "bg-primary/10", iconColor: "text-primary", items: ["Launch MVP", "Partner with 20 brands", "Reach 50k users"] },
  { phase: "1 Year", icon: Users, iconBg: "bg-gold/12", iconColor: "text-gold-dark", items: ["200k active users", "100+ fashion brands", "Expand across India"] },
  { phase: "3 Years", icon: Globe, iconBg: "bg-accent/18", iconColor: "text-accent-foreground", items: ["5M+ users", "Global partnerships", "Full AI fashion ecosystem"] },
];

export default function GrowthSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-gold/6 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-lavender mb-5 inline-flex">Growth Roadmap</span>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance">
            From Launch to<br />
            <span className="gradient-text">5 Million Users</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mb-24" style={{ perspective: 1000 }}>
          {roadmap.map((phase, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.15, duration: 0.5, type: "spring", stiffness: 80 }}
            >
              {i < roadmap.length - 1 && (
                <div className="hidden md:block absolute top-9 -right-3 z-10 text-muted-foreground text-sm">→</div>
              )}
              <motion.div
                className="bg-white/80 backdrop-blur-md rounded-[14px] p-6 border border-white/40 shadow-sm h-full"
                whileHover={{ y: -6, scale: 1.03, boxShadow: "0 16px 40px hsl(240 10% 40% / 0.12)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-xl ${phase.iconBg} flex items-center justify-center mb-5`}
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <phase.icon className={`w-6 h-6 ${phase.iconColor}`} />
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{phase.phase}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2.5 font-body text-muted-foreground text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${phase.iconColor.replace("text-", "bg-")}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-soft border border-white/40 shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/12 blur-3xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 px-10 py-16 text-center">
            <motion.span
              className="pill-blush mb-5 inline-flex"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              Join the Revolution
            </motion.span>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-foreground mb-4 text-balance leading-tight">
              India's Future of Fashion is Here.
            </h2>
            <p className="font-body text-muted-foreground text-base max-w-lg mx-auto mb-8 text-pretty">
              Be among the first brands to offer AI virtual try-on. Boost conversions. Cut returns. Delight customers.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button className="bg-primary text-primary-foreground font-body font-medium px-7 h-11 text-sm rounded-full hover:bg-primary/90 transition-all shadow-soft border-0">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" className="border-border text-foreground bg-white/70 hover:bg-white px-7 h-11 text-sm rounded-full font-body">
                  Book a Demo
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
