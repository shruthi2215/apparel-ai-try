import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function GrowthSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* CTA Banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(260 25% 12%), hsl(240 20% 8%))",
            border: "1px solid hsl(var(--hero-accent) / 0.15)",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated glow orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px]"
              style={{ background: "hsl(var(--hero-accent) / 0.15)" }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-[100px]"
              style={{ background: "hsl(var(--hero-glow) / 0.1)" }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10 px-10 py-20 text-center">
            <motion.div
              className="pill-blush mb-5 inline-flex"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Sparkles className="w-3 h-3" />
              Upgrade Your Experience
            </motion.div>

            <h2 className="font-display text-4xl lg:text-6xl font-bold text-foreground mb-4 text-balance leading-tight">
              Upgrade Your Shopping
              <br />
              <span className="gradient-text">Experience</span>
            </h2>
            <p className="font-body text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-10 text-pretty">
              Join thousands of brands already using AI virtual try-on. Boost conversions. Cut returns. Delight customers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => navigate("/try-on")}
                  className="font-body font-medium px-8 h-13 text-sm rounded-full border-0 transition-all animate-glow-border"
                  style={{
                    background: "var(--gradient-hero-accent)",
                    color: "hsl(0 0% 100%)",
                    boxShadow: "0 0 30px hsl(var(--hero-accent) / 0.4), 0 8px 32px hsl(var(--hero-accent) / 0.2)",
                  }}
                >
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  className="font-body px-8 h-13 text-sm rounded-full transition-all"
                  style={{
                    borderColor: "hsl(0 0% 100% / 0.1)",
                    color: "hsl(0 0% 80%)",
                    background: "hsl(0 0% 100% / 0.04)",
                  }}
                >
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
