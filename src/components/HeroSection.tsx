import heroImage from "@/assets/hero-tryon.jpg";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Star, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["Sarees", "Kurtis", "Dresses", "Shirts", "Lehenga", "Ethnic Fusion", "Formal Wear", "Western Wear"];

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-soft">
      {/* Soft background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-accent/15 blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-gold/8 blur-[70px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="pill-blush mb-7">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Virtual Try-On for India
            </div>

            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.05] mb-5 text-balance">
              Wear It
              <br />
              <span className="gradient-text">Before</span>
              <br />
              You Buy It.
            </h1>

            <p className="font-body text-muted-foreground text-base lg:text-lg leading-relaxed mb-8 max-w-md text-pretty">
              India's first AI fashion try-on. Upload your photo and see exactly how any saree, kurti, or dress looks on <span className="text-foreground font-medium">your body</span> in seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Button
                onClick={() => navigate("/try-on")}
                size="lg"
                className="bg-primary text-primary-foreground font-body font-medium px-7 h-12 text-sm rounded-full shadow-soft hover:bg-primary/90 hover:shadow-md transition-all animate-pulse-soft border-0"
              >
                <Upload className="w-4 h-4 mr-2" /> Try On Me
              </Button>
              <Button
                onClick={() => navigate("/products")}
                variant="outline"
                size="lg"
                className="border-border text-foreground bg-white/70 hover:bg-white px-7 h-12 text-sm rounded-full transition-all font-body"
              >
                Browse Products <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex -space-x-2.5">
                {["A","R","S","P"].map((c, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold font-body text-white"
                    style={{ background: ["hsl(330,45%,62%)","hsl(43,65%,58%)","hsl(280,40%,70%)","hsl(155,35%,58%)"][i] }}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
                </div>
                <p className="text-muted-foreground text-xs font-body">Trusted by <span className="text-foreground font-medium">10,000+</span> shoppers</p>
              </div>
            </div>
          </div>

          {/* Right – Hero image */}
          <div className="relative flex justify-center lg:justify-end animate-scale-in">
            <div className="absolute inset-4 rounded-3xl bg-primary/10 blur-2xl" />

            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border max-w-[420px] w-full bg-white">
              <img
                src={heroImage}
                alt="AI Virtual Try-On demonstration"
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Floating cards */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-border animate-float">
                <p className="text-muted-foreground text-xs font-body mb-0.5">Body Scan</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <p className="text-foreground text-sm font-medium font-body">99.2% Accuracy</p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-md border border-border">
                <p className="text-muted-foreground text-xs font-body mb-0.5">Try-On Ready</p>
                <p className="gradient-gold-text font-display text-lg font-semibold">245 Styles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
