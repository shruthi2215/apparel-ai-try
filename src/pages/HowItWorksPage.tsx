import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Upload, Wand2, ShoppingCart, Brain, Palette, Ruler, Zap } from "lucide-react";

export default function HowItWorksPage() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Your Photo",
      description: "Take a clear front-facing photo and upload it. Our AI system processes it securely and detects your key features.",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Wand2,
      step: "02",
      title: "Select Your Outfit",
      description: "Browse our curated catalog of sarees, kurtis, dresses, shirts and kids wear. Pick any style you love.",
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      icon: Brain,
      step: "03",
      title: "AI Analysis",
      description: "Our AI analyzes your skin tone, body shape, and the selected outfit to generate personalized styling recommendations.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: ShoppingCart,
      step: "04",
      title: "Shop with Confidence",
      description: "See AI suggestions for colors, fits and similar products. Add to cart and order knowing exactly how it'll look.",
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  const aiFeatures = [
    { icon: Palette, title: "Color Analysis", desc: "AI detects your skin undertone and recommends the most flattering color palettes for you." },
    { icon: Ruler, title: "Body Fit Analysis", desc: "Smart measurements suggest the best fits — slim, regular, loose — based on your body shape." },
    { icon: Zap, title: "Instant Suggestions", desc: "Get real-time recommendations for similar products, trending styles and complementary accessories." },
    { icon: Brain, title: "Style Intelligence", desc: "AI learns from millions of fashion data points to give you personalized, culturally-aware suggestions." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-body text-sm text-primary font-semibold">AI-Powered Fashion Technology</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4">
              How <span className="gradient-gold-text">Try On Me</span> Works
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              India's most advanced virtual try-on platform — powered by AI to help you shop smarter, 
              reduce returns, and look your best every time.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            {steps.map(({ icon: Icon, step, title, description, color, bg }) => (
              <div key={step} className="glass-card rounded-3xl p-6 md:p-8 flex gap-5 group hover:scale-[1.01] transition-transform">
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <div>
                  <div className={`font-display text-xs font-bold ${color} mb-1`}>STEP {step}</div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Features */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              AI Features That Set Us Apart
            </h2>
            <p className="font-body text-muted-foreground">Built specifically for Indian fashion and diverse body types</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {aiFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-5 text-center hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-body text-sm font-bold text-foreground mb-2">{title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center glass-card rounded-3xl p-10 bg-gradient-to-br from-primary/10 to-gold/5">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Ready to Try It Out?</h2>
            <p className="font-body text-muted-foreground mb-6">Experience AI virtual try-on for free — no credit card required</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/try-on")} className="bg-gradient-hero text-white font-body font-semibold px-8 py-3 rounded-full border-0 hover:scale-105 transition-transform shadow-brand text-base">
                <Sparkles className="w-4 h-4 mr-2" /> Start Virtual Try-On
              </Button>
              <Button onClick={() => navigate("/products")} variant="outline" className="border-white/20 text-foreground font-body font-semibold px-8 py-3 rounded-full text-base hover:bg-white/10">
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
