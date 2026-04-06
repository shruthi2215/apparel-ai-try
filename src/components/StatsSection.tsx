import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { value: "50K+", label: "Try-Ons Completed", sub: "And counting daily" },
  { value: "99.2%", label: "Accuracy Rate", sub: "AI precision you can trust" },
  { value: "<5s", label: "Generation Speed", sub: "From photo to preview" },
  { value: "40%", label: "Fewer Returns", sub: "Confidence before buying" },
];

const brands = ["Amazon", "Flipkart", "Myntra", "Meesho", "Shopify", "WooCommerce"];

function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setShow(true), 200);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  return (
    <span ref={ref} className="font-display text-4xl lg:text-5xl font-bold gradient-text inline-block">
      {show ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.5, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
          {value}
        </motion.span>
      ) : (
        <span className="opacity-0">{value}</span>
      )}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "hsl(var(--hero-accent) / 0.04)" }} />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="pill-blush mb-5 inline-flex">Performance</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Numbers That <span className="gradient-text">Speak</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20" style={{ perspective: 1000 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5, type: "spring", stiffness: 80 }}
            >
              <motion.div
                className="text-center p-6 glass-card rounded-2xl group"
                whileHover={{ y: -4, scale: 1.03, boxShadow: "0 16px 40px hsl(var(--hero-accent) / 0.12)", borderColor: "hsl(var(--hero-accent) / 0.2)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="mb-1.5">
                  <AnimatedCounter value={stat.value} />
                </div>
                <p className="font-body font-medium text-foreground text-sm mb-0.5">{stat.label}</p>
                <p className="font-body text-muted-foreground text-xs">{stat.sub}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Integration strip */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-muted-foreground text-xs tracking-widest uppercase mb-6">
            Integrates with your favourite platforms
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand, i) => (
              <motion.div
                key={i}
                className="px-5 py-2.5 rounded-full font-body font-medium text-sm cursor-default glass-card"
                style={{ color: "hsl(0 0% 70%)" }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.08, y: -2, borderColor: "hsl(var(--hero-accent) / 0.3)" }}
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
