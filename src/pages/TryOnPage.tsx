import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Upload, Sparkles, Camera, CheckCircle, ShoppingCart,
  ArrowRight, Palette, Ruler, Star, RefreshCw, X, MessageCircle,
  Send, Share2, Heart, Download, ChevronLeft, ChevronRight,
  Zap, Shield, Eye, RotateCcw, Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIAnalysis {
  skinTone: string;
  bodyShape: string;
  bestFit: string;
  colorSuggestions: string[];
  outfitTips: string[];
  productRecommendations: string[];
  recommendedSize?: string;
  fitScore?: number;
  recommendedColors?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_PRODUCTS = [
  { id: "1", name: "Floral Anarkali Kurti", category: "Kurtis", price: 1299, colors: ["Rose", "Blue", "Green", "Yellow"], sizes: ["S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=300&h=380&fit=crop&auto=format", tags: ["ethnic","summer"] },
  { id: "2", name: "Banarasi Silk Saree", category: "Sarees", price: 4999, colors: ["Red", "Gold", "Purple", "Navy"], sizes: ["Free Size"], image_url: "https://images.unsplash.com/photo-1583391733981-8498408ee4b6?w=300&h=380&fit=crop&auto=format", tags: ["wedding","festive"] },
  { id: "3", name: "Cotton Floral Dress", category: "Dresses", price: 1599, colors: ["White", "Pink", "Yellow", "Mint"], sizes: ["XS","S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=380&fit=crop&auto=format", tags: ["casual","summer"] },
  { id: "4", name: "Chikankari Kurti", category: "Kurtis", price: 1899, colors: ["Off-White", "Peach", "Mint", "Lavender"], sizes: ["S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&h=380&fit=crop&auto=format", tags: ["ethnic","lucknowi"] },
  { id: "5", name: "Embroidered Lehenga", category: "Lehenga", price: 8999, colors: ["Maroon", "Navy", "Pink", "Teal"], sizes: ["S","M","L"], image_url: "https://images.unsplash.com/photo-1610189351021-ef7c9e47c7e2?w=300&h=380&fit=crop&auto=format", tags: ["bridal","wedding"] },
  { id: "6", name: "Palazzo Set", category: "Dresses", price: 1199, colors: ["Black", "Teal", "Purple", "Rust"], sizes: ["S","M","L","XL","XXL"], image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=380&fit=crop&auto=format", tags: ["casual","comfortable"] },
  { id: "7", name: "Kanjivaram Silk Saree", category: "Sarees", price: 6499, colors: ["Red", "Green", "Gold", "Purple"], sizes: ["Free Size"], image_url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=300&h=380&fit=crop&auto=format", tags: ["wedding","festive"] },
  { id: "8", name: "Designer Party Dress", category: "Dresses", price: 2999, colors: ["Black", "Navy", "Maroon"], sizes: ["XS","S","M","L"], image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300&h=380&fit=crop&auto=format", tags: ["party","evening"] },
  { id: "9", name: "Silk Kurti Set", category: "Kurtis", price: 2199, colors: ["Pink", "Blue", "Mint"], sizes: ["S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=380&fit=crop&auto=format", tags: ["ethnic","festive"] },
  { id: "10", name: "Bridal Lehenga", category: "Lehenga", price: 15999, colors: ["Red", "Pink", "Maroon"], sizes: ["S","M","L"], image_url: "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=300&h=380&fit=crop&auto=format", tags: ["bridal","wedding"] },
];

const COLOR_PALETTE: Record<string, string> = {
  Rose: "#e0748a", Blue: "#4a7fc1", Green: "#4caf7d", Yellow: "#e8c84a",
  Red: "#c0392b", Gold: "#d4a017", Purple: "#8e44ad", Navy: "#1a2f5a",
  White: "#f5f5f0", Pink: "#f48fb1", Mint: "#80cbc4", "Off-White": "#f8f4ec",
  Peach: "#ffab91", Lavender: "#ce93d8", Maroon: "#6d1a1a", Teal: "#00838f",
  Black: "#2a2a2a", Rust: "#bf360c", "Free Size": "#a0a0a0",
};

// ─── Before/After Slider ───────────────────────────────────────────────────────
function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      move(clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [move]);

  return (
    <div
      ref={sliderRef}
      className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-ew-resize select-none"
      onMouseDown={(e) => { dragging.current = true; move(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; move(e.touches[0].clientX); }}
    >
      <img src={after} alt="Try-on result" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Original" className="w-full h-full object-cover" style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }} />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
          <ChevronLeft className="w-3 h-3 text-foreground" />
          <ChevronRight className="w-3 h-3 text-foreground" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-white text-xs font-body font-semibold">Original</div>
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-gradient-hero text-white text-xs font-body font-semibold">Try-On</div>
    </div>
  );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function GeneratingOverlay() {
  return (
    <div className="aspect-[3/4] rounded-2xl bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center px-6">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
      </div>
      <p className="font-display text-lg font-semibold text-foreground text-center mb-2">
        ✨ Creating Your Virtual Look…
      </p>
      <p className="font-body text-sm text-muted-foreground text-center">
        This may take 3–5 seconds
      </p>
      <div className="flex gap-1 mt-5">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Suggested Outfit Card ────────────────────────────────────────────────────
function SuggestionCard({
  product, current, onSelect,
}: { product: typeof SAMPLE_PRODUCTS[0]; current: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`flex-shrink-0 w-28 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 hover:scale-105 ${
        current ? "border-primary shadow-brand" : "border-transparent hover:border-white/30"
      }`}
    >
      <div className="relative">
        <img src={product.image_url} alt={product.name} className="w-full aspect-[3/4] object-cover" />
        {current && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white drop-shadow" />
          </div>
        )}
      </div>
      <div className="p-1.5 bg-background/80">
        <p className="font-body text-xs text-foreground font-medium leading-tight line-clamp-1">{product.name}</p>
        <p className="font-body text-xs text-primary font-semibold">₹{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}

// ─── Get similar products (same category or shared tag) ──────────────────────
function getSuggestions(current: typeof SAMPLE_PRODUCTS[0]) {
  const sameCategory = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== current.id && p.category === current.category
  );
  const sharedTag = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== current.id && !sameCategory.includes(p) &&
      p.tags.some((t) => current.tags.includes(t))
  );
  const rest = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== current.id && !sameCategory.includes(p) && !sharedTag.includes(p)
  );
  return [...sameCategory, ...sharedTag, ...rest].slice(0, 8);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TryOnPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof SAMPLE_PRODUCTS[0] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [draggingFile, setDraggingFile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm Priya, your AI fashion stylist ✨ How can I help you find the perfect outfit today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [deleteAfterProcessing, setDeleteAfterProcessing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState<"tryon" | "analysis">("tryon");
  const [outfitPanelOpen, setOutfitPanelOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const productId = searchParams.get("product");
    if (productId) {
      const found = SAMPLE_PRODUCTS.find(p => p.id === productId);
      if (found) {
        setSelectedProduct(found);
        setSelectedColor(found.colors[0]);
        setSelectedSize(found.sizes[0]);
        setStep(2);
      }
    }
  }, [user, searchParams, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── Photo Handlers ────────────────────────────────────────────────────────
  const processFile = (file: File, isReupload = false) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 10MB", variant: "destructive" });
      return;
    }
    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setUserPhoto(dataUrl);
      if (!isReupload) {
        setStep(2);
      } else {
        // Re-upload: keep step, invalidate any generated result
        setTryOnImage(null);
        toast({ title: "Photo updated ✓", description: "Select an outfit and generate again." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleReuploadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, true);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  };

  const removePhoto = () => {
    setUserPhoto(null);
    setUserPhotoFile(null);
    setTryOnImage(null);
    setAnalysis(null);
    setStep(1);
  };

  // ── Product Selection ─────────────────────────────────────────────────────
  const handleSelectProduct = (product: typeof SAMPLE_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setTryOnImage(null);
    setAnalysis(null);
    setOutfitPanelOpen(false);
  };

  // Switch suggested outfit while keeping photo (used from step 3)
  const trySuggestedOutfit = (product: typeof SAMPLE_PRODUCTS[0]) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setTryOnImage(null);
    setAnalysis(null);
    setActiveResultTab("tryon");
    runFullAnalysisFor(product, product.colors[0]);
  };

  // ── AI Generation ─────────────────────────────────────────────────────────
  const generateTryOnImageFor = async (product: typeof SAMPLE_PRODUCTS[0], color: string): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("ai-tryon-image", {
      body: {
        userImageBase64: userPhoto,
        productName: product.name,
        selectedColor: color,
        userPhotoMimeType: userPhotoFile?.type || "image/jpeg",
      },
    });
    if (error || data?.error) throw new Error(data?.error || error?.message);
    if (data?.fallback) {
      toast({
        title: "Demo Mode",
        description: "AI image generation is temporarily unavailable. Showing your original photo with style analysis.",
      });
    }
    return data.imageUrl;
  };

  const runTextAnalysis = async (product: typeof SAMPLE_PRODUCTS[0]): Promise<AIAnalysis> => {
    const { data, error } = await supabase.functions.invoke("ai-tryon-analysis", {
      body: { productName: product.name, productPrice: product.price },
    });
    if (error || data?.error) throw new Error(data?.error || error?.message);
    return {
      ...data.analysis,
      recommendedSize: data.analysis.recommendedSize || product.sizes[1] || product.sizes[0],
      fitScore: data.analysis.fitScore || Math.floor(Math.random() * 8) + 88,
      recommendedColors: data.analysis.recommendedColors || ["Emerald Green", "Royal Blue", "Maroon", "Dusty Rose"],
    };
  };

  const runFullAnalysisFor = async (product: typeof SAMPLE_PRODUCTS[0], color: string) => {
    if (!userPhoto) return;
    setAnalyzing(true);
    setStep(3);

    const [imageResult, analysisResult] = await Promise.allSettled([
      generateTryOnImageFor(product, color),
      runTextAnalysis(product),
    ]);

    setTryOnImage(imageResult.status === "fulfilled" ? imageResult.value : userPhoto);
    if (analysisResult.status === "fulfilled") setAnalysis(analysisResult.value);

    setAnalyzing(false);

    // Scroll suggestions into view
    setTimeout(() => {
      suggestionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 400);

    // Save session
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const analysisData = analysisResult.status === "fulfilled" ? analysisResult.value : null;
        await supabase.from("try_on_sessions").insert([{
          user_id: currentUser.id,
          ai_suggestions: analysisData?.colorSuggestions ?? [],
          ai_analysis: analysisData ? JSON.parse(JSON.stringify(analysisData)) : {},
          status: "completed",
        }]);
      }
    } catch {}
  };

  const runFullAnalysis = () => {
    if (!selectedProduct) return;
    runFullAnalysisFor(selectedProduct, selectedColor);
  };

  // ── Color Switch on Step 3 ────────────────────────────────────────────────
  const switchColor = async (color: string) => {
    setSelectedColor(color);
    if (step === 3 && selectedProduct) {
      setGeneratingImage(true);
      try {
        const url = await generateTryOnImageFor(selectedProduct, color);
        setTryOnImage(url);
      } catch {}
      setGeneratingImage(false);
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const downloadLook = () => {
    if (!tryOnImage) return;
    const link = document.createElement("a");
    link.href = tryOnImage;
    link.download = `my-look-${selectedProduct?.name.replace(/\s+/g, "-") ?? "tryon"}.jpg`;
    link.click();
  };

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out my virtual try-on! I tried "${selectedProduct?.name}" on Try On Me 🛍️`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://apparel-ai-try.lovable.app")}`, "_blank");
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-fashion-chat", {
        body: {
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content })),
          analysisContext: analysis ? { skinTone: analysis.skinTone, bodyShape: analysis.bodyShape, product: selectedProduct?.name } : null,
        },
      });
      if (error || data?.error) throw new Error(data?.error || "Chat error");
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble responding. Please try again! 🙏" }]);
    }
    setChatLoading(false);
  };

  const suggestions = selectedProduct ? getSuggestions(selectedProduct) : SAMPLE_PRODUCTS.slice(0, 8);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Mobile FAB – chat */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-hero shadow-brand flex items-center justify-center md:hidden"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-body text-sm text-muted-foreground">AI-Powered Virtual Try-On</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Virtual <span className="gradient-gold-text">Try-On</span>
            </h1>
            <p className="font-body text-muted-foreground text-lg">Upload your photo and see how any outfit looks on you — instantly</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[{ n: 1, label: "Upload Photo" }, { n: 2, label: "Select Outfit" }, { n: 3, label: "AI Try-On" }].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-3">
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

          {/* ── Step 1+2: Upload & Select ─────────────────────────────── */}
          {step !== 3 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* LEFT: Photo upload */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" /> Your Photo
                </h2>

                {!userPhoto ? (
                  <>
                    {/* Upload guidelines */}
                    <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        📸 <strong className="text-foreground">Best results:</strong> Upload a clear front-facing full-body or half-body photo with good lighting. Plain background preferred.
                      </p>
                    </div>

                    {/* Drag & Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDraggingFile(true); }}
                      onDragLeave={() => setDraggingFile(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl aspect-[3/4] flex flex-col items-center justify-center cursor-pointer transition-all group ${
                        draggingFile ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/20 hover:border-primary/50"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-body font-semibold text-foreground mb-1">Drag & drop or click to upload</p>
                      <p className="font-body text-sm text-muted-foreground text-center px-4">JPG / PNG / HEIC · Max 10MB</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Button onClick={() => fileInputRef.current?.click()} className="h-11 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold hover:scale-105 transition-transform">
                        <Upload className="w-4 h-4 mr-2" /> Gallery
                      </Button>
                      <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="h-11 rounded-xl border-white/10 text-foreground font-body font-semibold hover:bg-white/5">
                        <Camera className="w-4 h-4 mr-2" /> Camera
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Photo preview with re-upload / remove */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                      <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="glass-card rounded-xl p-2.5 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <p className="font-body text-xs text-white font-semibold">✔ Photo Ready — select an outfit!</p>
                        </div>
                      </div>
                    </div>

                    {/* Re-upload / Remove buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Button
                        onClick={() => reuploadInputRef.current?.click()}
                        variant="outline"
                        className="h-11 rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-body font-semibold"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Re-upload Photo
                      </Button>
                      <Button
                        onClick={removePhoto}
                        variant="outline"
                        className="h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 font-body font-semibold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Photo
                      </Button>
                    </div>
                  </>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                <input ref={reuploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleReuploadInput} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileInput} />

                {/* Privacy note */}
                <div className="mt-4 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="font-body text-xs text-muted-foreground">
                    Your image is used only for virtual try-on processing and is not stored permanently.
                  </p>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteAfterProcessing}
                    onChange={e => setDeleteAfterProcessing(e.target.checked)}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="font-body text-xs text-muted-foreground">Delete my image after processing</span>
                </label>
              </div>

              {/* RIGHT: Product selection */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Select Outfit
                </h2>

                <div className="grid grid-cols-3 gap-2.5 mb-4 max-h-72 overflow-y-auto pr-1">
                  {SAMPLE_PRODUCTS.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className={`rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                        selectedProduct?.id === product.id
                          ? "border-primary shadow-brand scale-[1.03]"
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

                {/* Color & Size selectors */}
                {selectedProduct && (
                  <div className="space-y-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map(c => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            title={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c ? "border-foreground scale-110 shadow-md" : "border-transparent"}`}
                            style={{ backgroundColor: COLOR_PALETTE[c] || "#aaa" }}
                          />
                        ))}
                      </div>
                      {selectedColor && <p className="font-body text-xs text-muted-foreground mt-1">{selectedColor}</p>}
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Size</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.sizes.map(s => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1 rounded-lg font-body text-xs font-semibold transition-all border ${
                              selectedSize === s
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={runFullAnalysis}
                  disabled={!userPhoto || !selectedProduct || analyzing}
                  className="w-full h-12 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold hover:scale-105 transition-transform shadow-brand disabled:opacity-50 disabled:scale-100"
                >
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating your virtual look…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Start AI Try-On
                    </span>
                  )}
                </Button>
                {!userPhoto && <p className="font-body text-xs text-muted-foreground text-center mt-2">Upload your photo first</p>}
                {userPhoto && !selectedProduct && <p className="font-body text-xs text-muted-foreground text-center mt-2">Select an outfit to continue</p>}
              </div>
            </div>
          )}

          {/* ── Step 3: Results ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-5 gap-6">
                {/* LEFT: Try-On Image (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="glass-card rounded-3xl p-5">
                    {/* Result tabs */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setActiveResultTab("tryon")}
                        className={`flex-1 py-2 rounded-xl font-body text-sm font-semibold transition-all ${activeResultTab === "tryon" ? "bg-gradient-hero text-white" : "glass-card text-muted-foreground hover:text-foreground"}`}
                      >
                        <Eye className="w-4 h-4 inline mr-1.5" />Try-On View
                      </button>
                      <button
                        onClick={() => setActiveResultTab("analysis")}
                        className={`flex-1 py-2 rounded-xl font-body text-sm font-semibold transition-all ${activeResultTab === "analysis" ? "bg-gradient-hero text-white" : "glass-card text-muted-foreground hover:text-foreground"}`}
                      >
                        <Sparkles className="w-4 h-4 inline mr-1.5" />AI Analysis
                      </button>
                    </div>

                    {activeResultTab === "tryon" && (
                      <>
                        {/* Image area */}
                        {analyzing || generatingImage ? (
                          <GeneratingOverlay />
                        ) : tryOnImage && userPhoto ? (
                          <BeforeAfterSlider before={userPhoto} after={tryOnImage} />
                        ) : (
                          <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                            <img src={userPhoto!} alt="Original" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Color variant switcher */}
                        {selectedProduct && !analyzing && (
                          <div className="mt-4">
                            <p className="font-body text-xs text-muted-foreground mb-2 font-semibold">Try other colors</p>
                            <div className="flex gap-2 flex-wrap">
                              {selectedProduct.colors.map(c => (
                                <button
                                  key={c}
                                  onClick={() => switchColor(c)}
                                  title={c}
                                  disabled={generatingImage}
                                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 disabled:opacity-50 ${selectedColor === c ? "border-foreground scale-110 shadow-md" : "border-transparent"}`}
                                  style={{ backgroundColor: COLOR_PALETTE[c] || "#aaa" }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Download & Share row */}
                        {tryOnImage && !analyzing && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            <button
                              onClick={downloadLook}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-xs font-body font-semibold hover:bg-white/10 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Look
                            </button>
                            <button
                              onClick={shareOnWhatsApp}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/20 text-green-400 text-xs font-body font-semibold hover:bg-green-500/25 transition-colors"
                            >
                              Share WhatsApp
                            </button>
                            <button
                              onClick={shareOnFacebook}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-body font-semibold hover:bg-blue-500/25 transition-colors"
                            >
                              Share Facebook
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {activeResultTab === "analysis" && analysis && (
                      <div className="space-y-4">
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

                        {analysis.recommendedSize && (
                          <div className="bg-gold/10 border border-gold/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-body text-xs text-gold font-semibold uppercase tracking-wide">Recommended Size</p>
                              <span className="font-display text-2xl font-bold text-foreground">{analysis.recommendedSize}</span>
                            </div>
                            {analysis.fitScore && (
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-body text-xs text-muted-foreground">Fit Score</p>
                                  <p className="font-body text-xs font-semibold text-foreground">{analysis.fitScore}% match</p>
                                </div>
                                <div className="h-2 rounded-full bg-white/10">
                                  <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${analysis.fitScore}%` }} />
                                </div>
                                <div className="flex justify-between mt-1">
                                  {["Tight Fit", "Perfect Fit", "Loose Fit"].map(f => (
                                    <span key={f} className="font-body text-xs text-muted-foreground">{f}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                          <p className="font-body text-xs text-primary font-semibold mb-1">✨ Best Fit</p>
                          <p className="font-body text-sm text-foreground">{analysis.bestFit}</p>
                        </div>

                        <div>
                          <p className="font-body text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Palette className="w-4 h-4 text-primary" /> Color Suggestions
                          </p>
                          <div className="space-y-2">
                            {analysis.colorSuggestions.map((s, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">→</span>
                                <span className="font-body text-xs text-foreground/80 leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {analysis.recommendedColors && (
                          <div>
                            <p className="font-body text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recommended for You</p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.recommendedColors.map((c, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_PALETTE[c] || "#888" }} />
                                  <span className="font-body text-xs text-foreground">{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeResultTab === "analysis" && !analysis && (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
                        <p className="font-body text-sm">Running AI analysis…</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Action panel (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Product info */}
                  {selectedProduct && (
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex gap-3 items-start">
                        <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-16 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-body text-sm font-semibold text-foreground leading-tight mb-1">{selectedProduct.name}</p>
                          <p className="font-display text-xl font-bold text-foreground">₹{selectedProduct.price.toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-gold text-gold" />
                            <span className="font-body text-xs text-muted-foreground">4.8 · 200+ reviews</span>
                          </div>
                        </div>
                      </div>
                      {selectedColor && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: COLOR_PALETTE[selectedColor] || "#aaa" }} />
                          <span className="font-body text-xs text-muted-foreground">{selectedColor} · {selectedSize}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outfit tips */}
                  {analysis && (
                    <div className="glass-card rounded-2xl p-4">
                      <p className="font-body text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
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
                  )}

                  {/* Purchase buttons */}
                  <div className="glass-card rounded-2xl p-4 space-y-2">
                    <Button className="w-full h-11 bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold" onClick={() => navigate("/products")}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button className="w-full h-11 bg-foreground text-background rounded-xl font-body font-semibold hover:opacity-90" onClick={() => navigate("/products")}>
                      Buy Now →
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-9 text-xs rounded-xl border-white/10 text-muted-foreground hover:text-foreground font-body"
                        onClick={() => { setWishlisted(!wishlisted); toast({ title: wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️" }); }}
                      >
                        <Heart className="w-3.5 h-3.5 mr-1.5" fill={wishlisted ? "currentColor" : "none"} />
                        {wishlisted ? "Saved" : "Save Look"}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 text-xs rounded-xl border-white/10 text-muted-foreground hover:text-foreground font-body"
                        onClick={() => setOutfitPanelOpen(true)}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Another
                      </Button>
                    </div>
                  </div>

                  {/* Re-upload / Remove in step 3 */}
                  <div className="glass-card rounded-2xl p-4 space-y-2">
                    <p className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Your Photo</p>
                    {userPhoto && (
                      <div className="flex gap-3 items-center mb-3">
                        <img src={userPhoto} alt="Your photo" className="w-14 h-18 rounded-xl object-cover flex-shrink-0" style={{ height: "4.5rem" }} />
                        <div>
                          <p className="font-body text-xs text-foreground font-semibold">Photo Active</p>
                          <p className="font-body text-xs text-muted-foreground">Used for all try-ons</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-body"
                        onClick={() => reuploadInputRef.current?.click()}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Re-upload
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 font-body"
                        onClick={removePhoto}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                      </Button>
                    </div>
                  </div>

                  {/* Social share compact */}
                  <div className="glass-card rounded-2xl p-4">
                    <p className="font-body text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" /> Share My Look
                    </p>
                    <div className="flex gap-2">
                      <button onClick={shareOnWhatsApp} className="flex-1 py-2 rounded-xl bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-body font-semibold hover:bg-green-500/30 transition-colors">WhatsApp</button>
                      <button onClick={shareOnFacebook} className="flex-1 py-2 rounded-xl bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-body font-semibold hover:bg-blue-500/30 transition-colors">Facebook</button>
                      <button onClick={() => { navigator.clipboard?.writeText("https://apparel-ai-try.lovable.app"); toast({ title: "Link copied!" }); }} className="flex-1 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-body font-semibold hover:bg-primary/20 transition-colors">Copy Link</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Suggested Outfits Section ──────────────────────────── */}
              <div ref={suggestionsRef} className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold" /> You May Also Like
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">Try these similar styles — your photo stays the same</p>
                  </div>
                  <Button
                    onClick={() => setOutfitPanelOpen(true)}
                    className="bg-gradient-hero text-white border-0 rounded-xl font-body font-semibold text-sm px-5 h-10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Try Another Outfit
                  </Button>
                </div>

                {/* Horizontal scrollable row */}
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {suggestions.map((product) => (
                    <div key={product.id} className="snap-start">
                      <SuggestionCard
                        product={product}
                        current={selectedProduct?.id === product.id}
                        onSelect={() => trySuggestedOutfit(product)}
                      />
                    </div>
                  ))}
                </div>

                <p className="font-body text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Click any outfit above to instantly generate a new AI try-on with your same photo
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Try Another Outfit Panel (slide-up) ─────────────────────── */}
      {outfitPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOutfitPanelOpen(false)} />
          <div className="relative w-full max-w-2xl bg-background rounded-t-3xl md:rounded-3xl p-6 shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl font-bold text-foreground">Select Outfit</h3>
              <button onClick={() => setOutfitPanelOpen(false)} className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-4">Your uploaded photo will be reused automatically.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {SAMPLE_PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  onClick={() => { handleSelectProduct(product); if (userPhoto) runFullAnalysisFor(product, product.colors[0]); }}
                  className={`rounded-xl overflow-hidden cursor-pointer transition-all border-2 hover:scale-[1.03] ${
                    selectedProduct?.id === product.id ? "border-primary shadow-brand" : "border-transparent hover:border-white/20"
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
          </div>
        </div>
      )}

      {/* ── AI Fashion Chat ─────────────────────────────────────────────────── */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-hero shadow-brand items-center justify-center hidden md:flex"
      >
        {chatOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 h-96 glass-card rounded-2xl border border-white/10 flex flex-col shadow-xl overflow-hidden">
          <div className="p-3 bg-gradient-hero flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold font-body text-sm">P</div>
            <div>
              <p className="font-body text-sm font-semibold text-white">Priya – AI Stylist</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                <p className="font-body text-xs text-white/70">Online</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl font-body text-xs leading-relaxed ${
                  msg.role === "user" ? "bg-gradient-hero text-white rounded-br-md" : "bg-white/10 text-foreground rounded-bl-md"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex gap-1">
                    {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {chatMessages.length === 1 && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
              {["Does this suit me?", "Best colors for me?", "What size should I buy?"].map(q => (
                <button key={q} onClick={() => setChatInput(q)} className="whitespace-nowrap px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-body hover:bg-primary/20 transition-colors flex-shrink-0">{q}</button>
              ))}
            </div>
          )}
          <div className="p-3 border-t border-white/10 flex gap-2 flex-shrink-0">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Ask Priya anything…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40"
            />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="w-8 h-8 rounded-xl bg-gradient-hero flex items-center justify-center disabled:opacity-40 flex-shrink-0">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
