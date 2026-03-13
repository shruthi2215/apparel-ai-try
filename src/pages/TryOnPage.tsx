import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Upload, Sparkles, Camera, CheckCircle, ShoppingCart,
  ArrowRight, Palette, Ruler, Star, RefreshCw, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SAMPLE_PRODUCTS = [
  { id: "1", name: "Floral Anarkali Kurti", price: 1299, image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=250&fit=crop" },
  { id: "2", name: "Banarasi Silk Saree", price: 4999, image_url: "https://images.unsplash.com/photo-1610189351021-ef7c9e47c7e2?w=200&h=250&fit=crop" },
  { id: "3", name: "Cotton Floral Dress", price: 1599, image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=250&fit=crop" },
  { id: "4", name: "Chikankari Kurti", price: 1899, image_url: "https://images.unsplash.com/photo-1553659971-f01207815844?w=200&h=250&fit=crop" },
  { id: "5", name: "Embroidered Lehenga", price: 8999, image_url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=200&h=250&fit=crop" },
  { id: "6", name: "Palazzo Set", price: 1199, image_url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=200&h=250&fit=crop" },
];

interface AIAnalysis {
  skinTone: string;
  bodyShape: string;
  bestFit: string;
  colorSuggestions: string[];
  outfitTips: string[];
  productRecommendations: string[];
}

export default function TryOnPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof SAMPLE_PRODUCTS[0] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const productId = searchParams.get("product");
    if (productId) {
      const found = SAMPLE_PRODUCTS.find(p => p.id === productId);
      if (found) { setSelectedProduct(found); setStep(2); }
    }
  }, [user, searchParams]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
    setStep(2);
  };

  const runAIAnalysis = async () => {
    if (!userPhoto || !selectedProduct) return;
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tryon-analysis", {
        body: {
          productName: selectedProduct.name,
          productPrice: selectedProduct.price,
        },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      setStep(3);

      // Save session to DB
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from("try_on_sessions").insert({
          user_id: currentUser.id,
          ai_suggestions: data.analysis.colorSuggestions,
          ai_analysis: data.analysis,
          status: "completed",
        });
      }
    } catch (err) {
      toast({ title: "AI Analysis Error", description: "Using demo analysis instead.", variant: "destructive" });
      // Fallback demo analysis
      setAnalysis({
        skinTone: "Warm Medium",
        bodyShape: "Hourglass",
        bestFit: "Regular / Semi-fitted",
        colorSuggestions: [
          "Earth tones (terracotta, rust, olive) complement your warm skin tone beautifully.",
          "Deep jewel tones like burgundy or forest green will give you a rich, elegant look.",
          "Avoid cool pastels — they may wash out your warm undertones."
        ],
        outfitTips: [
          `${selectedProduct?.name} is an excellent choice for your body shape.`,
          "A-line silhouettes will highlight your waist naturally.",
          "Vertical patterns can elongate your figure for a taller appearance."
        ],
        productRecommendations: [
          "Floral Anarkali in rust shade",
          "Silk blend kurti in olive green",
          "Embroidered palazzo set in terracotta"
        ]
      });
      setStep(3);
    }
    setAnalyzing(false);
  };

  const resetTryOn = () => {
    setUserPhoto(null);
    setUserPhotoFile(null);
    setSelectedProduct(null);
    setAnalysis(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Virtual <span className="gradient-gold-text">Try-On</span>
            </h1>
            <p className="font-body text-muted-foreground text-lg">
              Upload your photo, select an outfit and let AI style you
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { n: 1, label: "Upload Photo" },
              { n: 2, label: "Select Outfit" },
              { n: 3, label: "AI Analysis" },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-semibold transition-all ${
                  step === n ? "bg-gradient-hero text-white shadow-brand" :
                  step > n ? "bg-primary/20 text-primary" : "glass-card text-muted-foreground"
                }`}>
                  {step > n ? <CheckCircle className="w-4 h-4" /> : <span>{n}</span>}
                  <span className="hidden md:inline">{label}</span>
                </div>
                {i < 2 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* LEFT: Upload / Preview */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Your Photo
              </h2>

              {!userPhoto ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-2xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-body font-semibold text-foreground mb-1">Upload your photo</p>
                  <p className="font-body text-sm text-muted-foreground text-center px-4">
                    Front-facing photo works best<br />JPG, PNG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setUserPhoto(null); setUserPhotoFile(null); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {selectedProduct && step === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="glass-card rounded-xl p-3 text-center">
                          <Sparkles className="w-5 h-5 text-gold mx-auto mb-1" />
                          <p className="font-body text-xs text-white font-semibold">AI Try-On Preview</p>
                          <p className="font-body text-xs text-white/70">{selectedProduct.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              {!userPhoto && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-4 h-12 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold hover:scale-105 transition-transform"
                >
                  <Upload className="w-4 h-4 mr-2" /> Choose Photo
                </Button>
              )}
            </div>

            {/* RIGHT: Product selection or AI results */}
            <div className="glass-card rounded-3xl p-6">
              {step !== 3 ? (
                <>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Select Outfit
                  </h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {SAMPLE_PRODUCTS.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                          selectedProduct?.id === product.id
                            ? "border-primary shadow-brand scale-[1.02]"
                            : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <img src={product.image_url} alt={product.name} className="w-full aspect-[3/4] object-cover" />
                        <div className="p-1.5">
                          <p className="font-body text-xs text-foreground font-medium leading-tight line-clamp-1">{product.name}</p>
                          <p className="font-body text-xs text-primary font-semibold">₹{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={runAIAnalysis}
                    disabled={!userPhoto || !selectedProduct || analyzing}
                    className="w-full h-12 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold hover:scale-105 transition-transform shadow-brand disabled:opacity-50 disabled:scale-100"
                  >
                    {analyzing ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Start AI Try-On</>
                    )}
                  </Button>
                  {!userPhoto && <p className="font-body text-xs text-muted-foreground text-center mt-2">Please upload your photo first</p>}
                  {userPhoto && !selectedProduct && <p className="font-body text-xs text-muted-foreground text-center mt-2">Select an outfit to continue</p>}
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" /> AI Analysis Results
                  </h2>
                  {analysis && (
                    <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                      {/* Body info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Palette className="w-4 h-4 text-primary" />
                            <span className="font-body text-xs text-muted-foreground">Skin Tone</span>
                          </div>
                          <p className="font-body text-sm font-semibold text-foreground">{analysis.skinTone}</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Ruler className="w-4 h-4 text-primary" />
                            <span className="font-body text-xs text-muted-foreground">Body Shape</span>
                          </div>
                          <p className="font-body text-sm font-semibold text-foreground">{analysis.bodyShape}</p>
                        </div>
                      </div>

                      <div className="bg-gold/10 border border-gold/20 rounded-xl p-3">
                        <p className="font-body text-xs text-gold font-semibold mb-1">✨ Best Fit for You</p>
                        <p className="font-body text-sm text-foreground">{analysis.bestFit}</p>
                      </div>

                      <div>
                        <p className="font-body text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                          <Palette className="w-4 h-4 text-primary" /> Color Suggestions
                        </p>
                        <div className="space-y-2">
                          {analysis.colorSuggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-0.5">→</span>
                              <span className="font-body text-foreground/80 text-xs leading-relaxed">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-body text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                          <Star className="w-4 h-4 text-gold" /> Outfit Tips
                        </p>
                        <div className="space-y-2">
                          {analysis.outfitTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="font-body text-xs text-foreground/80 leading-relaxed">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-body text-sm font-semibold text-foreground mb-2">Recommended for You</p>
                        <div className="space-y-1">
                          {analysis.productRecommendations.map((rec, i) => (
                            <div key={i} className="flex items-center justify-between glass-card rounded-lg px-3 py-2">
                              <span className="font-body text-xs text-foreground">{rec}</span>
                              <Button
                                size="sm"
                                className="h-6 px-2 text-xs bg-gradient-hero text-white border-0 rounded-md font-body"
                                onClick={() => navigate("/products")}
                              >
                                View
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => navigate("/products")}
                          className="flex-1 h-10 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold text-sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" /> Buy Now
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetTryOn}
                          className="h-10 px-4 rounded-xl border-white/10 text-muted-foreground font-body text-sm hover:text-foreground"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
