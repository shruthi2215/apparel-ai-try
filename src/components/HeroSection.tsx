import heroImage from "@/assets/hero-tryon.jpg";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Star, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-bg">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-glow/10 blur-[140px]" />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-body text-gold font-medium tracking-wide">AI-Powered Virtual Try-On</span>
            </div>

            <h1 className="font-display text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-6">
              <span className="text-foreground/10 text-white">Wear It</span>
              <br />
              <span className="gradient-text">Before</span>
              <br />
              <span className="text-white">You Buy It.</span>
            </h1>

            <p className="font-body text-white/60 text-lg leading-relaxed mb-10 max-w-md">
              India's first AI fashion try-on platform. Upload your photo and see exactly how any outfit looks on <span className="text-gold font-medium">your body</span> — sarees, kurtis, dresses & more.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="default" size="lg" className="bg-gradient-hero text-white font-semibold px-8 py-6 text-base rounded-full shadow-brand hover:scale-105 transition-transform animate-pulse-glow border-0">
                Try It Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 text-white bg-transparent hover:bg-white/10 px-8 py-6 text-base rounded-full transition-all">
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full border-2 border-dark-bg bg-primary flex items-center justify-center text-xs font-bold font-body text-primary-foreground">A</div>
                <div className="w-9 h-9 rounded-full border-2 border-dark-bg bg-gold flex items-center justify-center text-xs font-bold font-body text-foreground">R</div>
                <div className="w-9 h-9 rounded-full border-2 border-dark-bg bg-primary-glow flex items-center justify-center text-xs font-bold font-body text-primary-foreground">S</div>
                <div className="w-9 h-9 rounded-full border-2 border-dark-bg bg-secondary flex items-center justify-center text-xs font-bold font-body text-secondary-foreground">P</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                </div>
                <p className="text-white/50 text-sm font-body">Trusted by <span className="text-white font-semibold">10,000+</span> shoppers</p>
              </div>
            </div>
          </div>

          {/* Right – Hero image */}
          <div className="relative flex justify-center lg:justify-end animate-scale-in">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-gold/30 blur-3xl scale-110" />

            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-white/10 max-w-[460px] w-full">
              <img
                src={heroImage}
                alt="AI Virtual Try-On - Woman wearing saree with holographic overlay"
                className="w-full h-full object-cover"
              />

              {/* Floating UI cards */}
              <div className="absolute top-4 left-4 glass-card rounded-2xl px-4 py-3 animate-float">
                <p className="text-white/70 text-xs font-body mb-1">Body Scan Complete</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-white text-sm font-semibold font-body">99.2% Accuracy</p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 glass-card rounded-2xl px-4 py-3" style={{ animationDelay: "1s" }}>
                <p className="text-white/70 text-xs font-body mb-1">Try-On Ready</p>
                <p className="gradient-gold-text font-display text-lg font-bold">245 Styles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll ticker */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/10 py-3 bg-white/5">
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, block) => (
            <div key={block} className="flex gap-12">
              {["Sarees", "Kurtis", "Dresses", "Shirts", "Kids Wear", "Western Wear", "Ethnic Fusion", "Formal Wear"].map((item, i) => (
                <span key={i} className="text-white/40 text-sm font-body tracking-widest uppercase flex items-center gap-3">
                  <span className="text-gold">✦</span> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
