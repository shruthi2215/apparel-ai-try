import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import beforeImg from "@/assets/demo-before.jpg";
import afterImg from "@/assets/demo-after.jpg";

type Phase = "idle" | "loading" | "reveal";

function LoadingOverlay() {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center"
      style={{ background: "hsl(240 20% 4% / 0.9)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full border-2 mb-5"
        style={{ borderColor: "hsl(var(--hero-accent) / 0.2)", borderTopColor: "hsl(var(--hero-accent))" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: "var(--gradient-hero-accent)" }}
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="font-body text-sm" style={{ color: "hsl(var(--hero-accent))" }}>
        Generating with AI…
      </p>
      <motion.div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "hsl(var(--hero-accent))" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function ComparisonSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden cursor-col-resize select-none"
      style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}
      onMouseDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); updatePosition(e.touches[0].clientX); }}
    >
      <img src={afterImg} alt="After AI try-on" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={640} height={896} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={beforeImg} alt="Before AI try-on" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={640} height={896} />
      </div>
      <div className="absolute top-0 bottom-0 w-[2px] z-10" style={{ left: `${sliderPos}%`, background: "hsl(0 0% 100% / 0.8)" }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "hsl(0 0% 100%)", boxShadow: "0 0 20px hsl(var(--hero-accent) / 0.4)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="hsl(240,15%,18%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="hsl(240,15%,18%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <motion.div
        className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-body font-medium"
        style={{ background: "hsl(0 0% 0% / 0.6)", color: "hsl(0 0% 100%)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        Before
      </motion.div>
      <motion.div
        className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-body font-medium"
        style={{ background: "hsl(var(--hero-accent) / 0.7)", color: "hsl(0 0% 100%)", backdropFilter: "blur(4px)" }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        After
      </motion.div>
    </div>
  );
}

export default function AIDemoSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [phase, setPhase] = useState<Phase>("idle");
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (!isInView || hasPlayed.current) return;
    hasPlayed.current = true;
    setPhase("loading");
    const timer = setTimeout(() => setPhase("reveal"), 2800);
    return () => clearTimeout(timer);
  }, [isInView]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: "hsl(var(--hero-accent) / 0.06)" }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <motion.div className="pill-lavender mb-5 inline-flex" initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            <Sparkles className="w-3.5 h-3.5" />
            Live Preview
          </motion.div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            See the <span className="gradient-text">Magic</span> in Action
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Drag the slider to compare before and after. Our AI fits the outfit to your exact body shape.
          </p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto relative"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === "loading" && <LoadingOverlay key="loading" />}
            </AnimatePresence>

            {phase === "idle" && (
              <div className="relative aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 100% / 0.08)" }}>
                <img src={beforeImg} alt="Before" className="w-full h-full object-cover" loading="lazy" width={640} height={896} />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-body font-medium" style={{ background: "hsl(0 0% 0% / 0.6)", color: "hsl(0 0% 100%)" }}>Before</div>
              </div>
            )}

            {phase === "loading" && (
              <div className="relative aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden">
                <img src={beforeImg} alt="Processing" className="w-full h-full object-cover" loading="lazy" width={640} height={896} />
              </div>
            )}

            {phase === "reveal" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                <ComparisonSlider />
              </motion.div>
            )}
          </div>

          <div className="absolute -inset-4 -z-10 rounded-3xl blur-2xl" style={{ background: "hsl(var(--hero-accent) / 0.08)" }} />
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate("/try-on")}
              size="lg"
              className="font-body font-medium px-8 h-12 text-sm rounded-full border-0 transition-all"
              style={{
                background: "var(--gradient-hero-accent)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 0 20px hsl(var(--hero-accent) / 0.3)",
              }}
            >
              Try It Yourself <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
