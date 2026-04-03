import heroImage from "@/assets/hero-tryon.jpg";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Star, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const categories = ["Sarees", "Kurtis", "Dresses", "Shirts", "Lehenga", "Ethnic Fusion", "Formal Wear", "Western Wear"];

export default function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-soft">
      {/* Animated parallax blobs */}
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ y: bgY }}>
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]"
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-accent/15 blur-[80px]"
          animate={{ scale: [1, 1.2, 1], x: [0, -25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-gold/8 blur-[70px]"
          animate={{ scale: [1, 1.1, 1], y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div className="container mx-auto px-4 relative z-10 py-28" style={{ scale: heroScale, opacity: heroOpacity }}>
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left content */}
          <div>
            {/* Badge */}
            <motion.div
              className="pill-blush mb-7"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Virtual Try-On for India
            </motion.div>

            <motion.h1
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] mb-5 text-balance"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Wear It
              <br />
              <motion.span
                className="gradient-text inline-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 120 }}
              >
                Before
              </motion.span>
              <br />
              You Buy It.
            </motion.h1>

            <motion.p
              className="font-body text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-md text-pretty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              India's first AI fashion try-on. Upload your photo and see exactly how any saree, kurti, or dress looks on <span className="text-foreground font-medium">your body</span> in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => navigate("/try-on")}
                  size="lg"
                  className="bg-primary text-primary-foreground font-body font-medium px-7 h-12 text-sm rounded-full shadow-soft hover:bg-primary/90 hover:shadow-md transition-all animate-pulse-soft border-0"
                >
                  <Upload className="w-4 h-4 mr-2" /> Try On Me
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => navigate("/products")}
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground bg-white/70 hover:bg-white px-7 h-12 text-sm rounded-full transition-all font-body"
                >
                  Browse Products <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex items-center gap-5 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex -space-x-2.5">
                {["A","R","S","P"].map((c, i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold font-body text-white"
                    style={{ background: ["hsl(330,45%,62%)","hsl(43,65%,58%)","hsl(280,40%,70%)","hsl(155,35%,58%)"][i] }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {c}
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.08, type: "spring" }}
                    >
                      <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs font-body">Trusted by <span className="text-foreground font-medium">10,000+</span> shoppers</p>
              </div>
            </motion.div>
          </div>

          {/* Right – Hero image with 3D tilt */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 60, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 60 }}
            style={{ perspective: 1200 }}
          >
            <div className="absolute inset-4 rounded-3xl bg-primary/10 blur-2xl" />

            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-lg border border-border max-w-[420px] w-full bg-white"
              whileHover={{ rotateY: -5, rotateX: 3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={heroImage}
                alt="AI Virtual Try-On demonstration"
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Floating cards */}
              <motion.div
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-md border border-white/30"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transform: "translateZ(40px)" }}
              >
                <p className="text-muted-foreground text-xs font-body mb-0.5">Body Scan</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <p className="text-foreground text-sm font-medium font-body">99.2% Accuracy</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-md border border-white/30"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ transform: "translateZ(30px)" }}
              >
                <p className="text-muted-foreground text-xs font-body mb-0.5">Try-On Ready</p>
                <p className="gradient-gold-text font-display text-lg font-semibold">245 Styles</p>
              </motion.div>

              {/* Glassmorphism shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll ticker */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-border py-2.5 bg-white/60 backdrop-blur-sm">
        <div className="flex gap-10 animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, block) => (
            <div key={block} className="flex gap-10">
              {categories.map((item, i) => (
                <span key={i} className="text-muted-foreground text-xs font-body tracking-widest uppercase flex items-center gap-2.5">
                  <span className="text-gold text-sm">✦</span> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
