import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useCallback, useEffect, useState } from "react";

// Floating particle component
function Particle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(var(--hero-accent) / 0.6), transparent)`,
      }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Grid lines background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--hero-accent) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--hero-accent) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  delay: Math.random() * 5,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 4,
}));

export default function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  // Animated counter
  const [tryOnCount, setTryOnCount] = useState(0);
  useEffect(() => {
    const target = 50000;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setTryOnCount(target);
        clearInterval(timer);
      } else {
        setTryOnCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-hero-bg)" }}
    >
      {/* Ambient glow */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero-glow)" }}
        />
        {/* Orb 1 */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            top: "-10%",
            left: "20%",
            background: "hsl(var(--hero-accent) / 0.08)",
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orb 2 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            bottom: "-15%",
            right: "10%",
            background: "hsl(var(--hero-glow) / 0.06)",
          }}
          animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orb 3 - center */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[90px]"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "hsl(var(--primary) / 0.05)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Grid */}
      <GridBackground />

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
      ))}

      {/* Horizontal light sweep */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px] pointer-events-none"
        style={{ background: "var(--gradient-hero-accent)", opacity: 0.3 }}
        animate={{ scaleX: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto px-4 py-32"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-body font-medium mb-8 border"
          style={{
            background: "hsl(var(--hero-accent) / 0.1)",
            borderColor: "hsl(var(--hero-accent) / 0.2)",
            color: "hsl(var(--hero-accent))",
          }}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Virtual Try-On
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.05] mb-6"
          style={{ color: "hsl(var(--hero-text))" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          See Yourself in
          <br />
          Any Outfit —{" "}
          <motion.span
            className="inline-block"
            style={{
              background: "var(--gradient-hero-accent)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.6, type: "spring", stiffness: 100 }}
          >
            Instantly
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="font-body text-base md:text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "hsl(var(--hero-muted))" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Upload your photo and our AI shows you exactly how any outfit looks on your body — no guesswork, no returns.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate("/try-on")}
              size="lg"
              className="font-body font-medium px-8 h-13 text-sm rounded-full border-0 shadow-lg"
              style={{
                background: "var(--gradient-hero-accent)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 0 30px hsl(var(--hero-accent) / 0.3), 0 8px 32px hsl(var(--hero-accent) / 0.2)",
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Try Now
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              size="lg"
              className="font-body px-8 h-13 text-sm rounded-full transition-all"
              style={{
                borderColor: "hsl(var(--hero-text) / 0.15)",
                color: "hsl(var(--hero-text))",
                background: "hsl(var(--hero-text) / 0.05)",
              }}
            >
              <Play className="w-4 h-4 mr-2" /> Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 md:gap-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {[
            { value: `${(tryOnCount / 1000).toFixed(0)}K+`, label: "Try-Ons Completed" },
            { value: "99.2%", label: "Accuracy Rate" },
            { value: "< 5s", label: "Generation Time" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
            >
              <p
                className="font-display text-2xl md:text-3xl font-semibold mb-1"
                style={{
                  background: "var(--gradient-hero-accent)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </p>
              <p className="font-body text-xs md:text-sm" style={{ color: "hsl(var(--hero-muted))" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
      />
    </section>
  );
}
