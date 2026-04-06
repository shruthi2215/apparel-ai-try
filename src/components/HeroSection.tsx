import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

// Floating 3D sphere
function FloatingSphere({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: `blur(${size > 60 ? 2 : 0}px)`,
      }}
      animate={{
        y: [0, -25, 0],
        x: [0, 10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

const spheres = [
  { id: 0, delay: 0, x: "8%", y: "20%", size: 80, color: "hsl(260 80% 65% / 0.15)" },
  { id: 1, delay: 1, x: "85%", y: "15%", size: 120, color: "hsl(220 90% 55% / 0.1)" },
  { id: 2, delay: 2, x: "75%", y: "65%", size: 60, color: "hsl(190 90% 55% / 0.12)" },
  { id: 3, delay: 0.5, x: "15%", y: "70%", size: 100, color: "hsl(260 80% 65% / 0.08)" },
  { id: 4, delay: 3, x: "50%", y: "10%", size: 40, color: "hsl(220 90% 55% / 0.15)" },
  { id: 5, delay: 1.5, x: "92%", y: "45%", size: 50, color: "hsl(260 80% 65% / 0.12)" },
];

const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  delay: Math.random() * 5,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: 1.5 + Math.random() * 2.5,
}));

export default function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  // Mouse parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x, y });
  }, []);

  // Counter
  const [tryOnCount, setTryOnCount] = useState(0);
  useEffect(() => {
    const target = 50000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setTryOnCount(target); clearInterval(timer); }
      else setTryOnCount(Math.floor(current));
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-hero-bg)" }}
      onMouseMove={handleMouseMove}
    >
      {/* Ambient glow orbs with mouse parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: mousePos.x * -20,
          y: mousePos.y * -20,
        }}
      >
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero-glow)" }} />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[140px]"
          style={{ top: "-15%", left: "15%", background: "hsl(var(--hero-accent) / 0.1)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ bottom: "-10%", right: "5%", background: "hsl(var(--hero-glow) / 0.08)" }}
          animate={{ scale: [1, 1.15, 1], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ top: "50%", left: "60%", background: "hsl(190 90% 55% / 0.05)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--hero-accent) / 0.4) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--hero-accent) / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* 3D Floating spheres with parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ x: mousePos.x * 30, y: mousePos.y * 30 }}
      >
        {spheres.map((s) => (
          <FloatingSphere key={s.id} {...s} />
        ))}
      </motion.div>

      {/* Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: "hsl(var(--hero-accent) / 0.5)",
          }}
          animate={{ y: [0, -20, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Horizontal light sweep */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px] pointer-events-none"
        style={{ background: "var(--gradient-hero-accent)", opacity: 0.25 }}
        animate={{ scaleX: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto px-4 py-32"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-body font-medium mb-8"
          style={{
            background: "hsl(var(--hero-accent) / 0.1)",
            border: "1px solid hsl(var(--hero-accent) / 0.2)",
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
          className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6"
          style={{ color: "hsl(var(--hero-text))" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          Try Before You Buy
          <br />
          with{" "}
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
            AI
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
          Experience the future of fashion with virtual try-on. See how any outfit looks on you — instantly.
        </motion.p>

        {/* CTA */}
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
              className="font-body font-medium px-10 h-14 text-base rounded-full border-0 shadow-lg animate-glow-border"
              style={{
                background: "var(--gradient-hero-accent)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 0 30px hsl(var(--hero-accent) / 0.4), 0 8px 32px hsl(var(--hero-accent) / 0.2)",
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Try Now
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
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
