import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload, Sparkles, Camera, CheckCircle, X, Shield,
  ChevronLeft, ChevronRight, Download, Heart, Share2,
  RotateCcw, Trash2, Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAvatar } from "@/hooks/useAvatar";
import AvatarPortrait from "@/components/avatar/AvatarPortrait";
import AvatarBuilder from "@/components/avatar/AvatarBuilder";
import { BODY_SIZES, type BodySize, type FaceAnalysis, type Gender } from "@/lib/avatar";

interface TryOnModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    colors: string[];
    sizes: string[];
    image_url: string;
  };
}

const COLOR_PALETTE: Record<string, string> = {
  Rose: "#e0748a", Blue: "#4a7fc1", Green: "#4caf7d", Yellow: "#e8c84a",
  Red: "#c0392b", Gold: "#d4a017", Purple: "#8e44ad", Navy: "#1a2f5a",
  White: "#f5f5f0", Pink: "#f48fb1", Mint: "#80cbc4", "Off-White": "#f8f4ec",
  Peach: "#ffab91", Lavender: "#ce93d8", Maroon: "#6d1a1a", Teal: "#00838f",
  Black: "#2a2a2a", Rust: "#bf360c", Orange: "#e65100", Beige: "#d4c5a9",
};

const INNERWEAR_CATEGORIES = ["Innerwear", "Lingerie", "Underwear", "Undergarments"];

const LOADING_MESSAGES = [
  "Analyzing your image…",
  "Detecting body pose & proportions…",
  "Fitting your outfit…",
  "Adjusting fabric draping…",
  "Matching lighting & shadows…",
  "Almost ready…",
];

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
      move("touches" in e ? e.touches[0].clientX : e.clientX);
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

export default function TryOnModal({ open, onClose, product }: TryOnModalProps) {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [generating, setGenerating] = useState(false);
  const [tryOnImage, setTryOnImage] = useState<string | null>(null);
  const [deleteAfterProcessing, setDeleteAfterProcessing] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [mode, setMode] = useState<null | "photo" | "avatar">(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { avatar, avatarImageUrl, loading: avatarLoading, saveAvatar, reload: reloadAvatar } = useAvatar();
  const [editAvatar, setEditAvatar] = useState(false);
  const [draftSize, setDraftSize] = useState<BodySize>("M");
  const [draftGender, setDraftGender] = useState<Gender>("female");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [rebuild, setRebuild] = useState(false);

  useEffect(() => {
    if (avatar) {
      setDraftSize(avatar.body_size as BodySize);
      setDraftGender(avatar.gender as Gender);
    }
  }, [avatar?.id, avatar?.body_size, avatar?.gender]);

  const saveAvatarEdits = async () => {
    if (!avatar) return;
    setSavingAvatar(true);
    try {
      await saveAvatar({
        gender: draftGender,
        bodySize: draftSize,
        face: avatar.face_data as FaceAnalysis,
        photoFile: null,
        assetUrl: avatar.avatar_asset_url,
        consent: avatar.consent_given,
      });
      await reloadAvatar();
      setEditAvatar(false);
      toast({ title: "Avatar updated", description: "Your saved avatar is reused on every try-on." });
    } catch (err) {
      toast({ title: "Couldn't save", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    } finally {
      setSavingAvatar(false);
    }
  };

  const isInnerwear = INNERWEAR_CATEGORIES.some(
    (cat) => product.category.toLowerCase() === cat.toLowerCase()
  );

  // Reset on product change
  useEffect(() => {
    setSelectedColor(product.colors[0] || "");
    setTryOnImage(null);
    setProgress(0);
    setLoadingMsgIndex(0);
    setMode(null);
  }, [product.id]);

  // Animated loading messages
  useEffect(() => {
    if (!generating) return;
    setLoadingMsgIndex(0);
    setProgress(0);
    const msgInterval = setInterval(() => {
      setLoadingMsgIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 2500);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 300);
    return () => { clearInterval(msgInterval); clearInterval(progressInterval); };
  }, [generating]);

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 10MB", variant: "destructive" });
      return;
    }
    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
    setTryOnImage(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const removePhoto = () => {
    setUserPhoto(null);
    setUserPhotoFile(null);
    setTryOnImage(null);
  };

  const generateTryOn = async (color?: string, sourceImage?: string) => {
    const baseImage = sourceImage || userPhoto;
    if (!baseImage) return;
    const useColor = color || selectedColor;
    setGenerating(true);
    setTryOnImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tryon-image", {
        body: {
          userImageBase64: baseImage,
          productName: product.name,
          productImageUrl: product.image_url,
          productCategory: product.category,
          selectedColor: useColor,
          userPhotoMimeType: userPhotoFile?.type || "image/jpeg",
        },
      });

      if (error) {
        const message = error?.message || "Try-on failed";
        if (message.includes("credits") || message.includes("402")) {
          toast({ title: "AI Credits Needed", description: "Please add credits in Settings → Workspace → Usage.", variant: "destructive" });
        } else {
          toast({ title: "Try-on failed", description: message, variant: "destructive" });
        }
        return;
      }

      if (data?.validationFailed) {
        toast({ title: "Photo Issue", description: data.error || "Please upload a clear front-facing photo.", variant: "destructive" });
        return;
      }
      if (data?.creditError || data?.rateLimited) {
        toast({ title: data.creditError ? "Credits Needed" : "Rate Limited", description: data.error, variant: "destructive" });
        return;
      }
      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      setTryOnImage(data.imageUrl);
      setProgress(100);

      // Save session
      if (user) {
        try {
          await supabase.from("try_on_sessions").insert([{
            user_id: user.id,
            status: "completed",
          }]);
        } catch {}
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const switchColor = (color: string) => {
    setSelectedColor(color);
    if (tryOnImage && userPhoto) {
      generateTryOn(color);
    }
  };

  const downloadLook = () => {
    if (!tryOnImage) return;
    const link = document.createElement("a");
    link.href = tryOnImage;
    link.download = `tryon-${product.name.replace(/\s+/g, "-")}.jpg`;
    link.click();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-2xl border border-border shadow-lg z-10">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <img src={product.image_url} alt={product.name} className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold text-foreground truncate">{product.name}</h3>
              <p className="font-body text-xs text-primary font-semibold">₹{product.price.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Innerwear restriction */}
          {isInnerwear ? (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-sm text-foreground font-medium mb-1">Try-on not available</p>
              <p className="font-body text-xs text-muted-foreground">Try-on is not available for this category due to privacy policy.</p>
            </div>
          ) : (
            mode === null ? (
              /* Step 1 — how do you want to try this on? */
              <div className="space-y-3">
                <p className="font-body text-sm font-medium text-foreground">How would you like to try this on?</p>
                <button
                  onClick={() => setMode("photo")}
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">Upload your photo</p>
                      <p className="font-body text-xs text-muted-foreground">Quick try-on for this session only.</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setMode("avatar")}
                  className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-body text-sm font-semibold text-foreground">
                        {avatar ? "Use my saved avatar" : "Create my avatar from a photo"}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {avatar
                          ? `${avatar.gender === "female" ? "Female" : "Male"} · Size ${avatar.body_size} · saved to your account`
                          : "Upload one photo, set your height & size — saved for every visit."}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ) : mode === "avatar" ? (
              /* Step 1b — saved avatar try-on */
              <div className="space-y-4">
                <button
                  onClick={() => setMode(null)}
                  className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                {avatarLoading ? (
                  <p className="font-body text-sm text-muted-foreground py-6 text-center">Loading your avatar…</p>
                ) : !user ? (
                  <p className="font-body text-sm text-muted-foreground py-6 text-center">
                    Sign in to create and save your personal avatar.
                  </p>
                ) : avatar && !rebuild ? (
                  <>
                    {tryOnImage ? (
                      <div className="rounded-2xl overflow-hidden border border-border bg-muted">
                        <img src={tryOnImage} alt={`Your avatar wearing ${product.name}`} className="w-full object-contain" />
                      </div>
                    ) : generating ? (
                      <div className="space-y-4 py-4">
                        <div className="flex flex-col items-center">
                          <div className="relative mb-4">
                            <div className="w-14 h-14 rounded-full border-[3px] border-primary/15 border-t-primary animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                          </div>
                          <p className="font-body text-sm text-primary font-medium text-center">
                            {LOADING_MESSAGES[loadingMsgIndex]}
                          </p>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <AvatarPortrait
                        imageUrl={avatarImageUrl}
                        gender={draftGender}
                        bodySize={draftSize}
                        heightCm={avatar.height_cm}
                      />
                    )}

                    {product.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            title={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c ? "border-foreground scale-110 shadow-sm" : "border-transparent"}`}
                            style={{ backgroundColor: COLOR_PALETTE[c] || "#aaa" }}
                          />
                        ))}
                      </div>
                    )}

                    {!tryOnImage ? (
                      <Button
                        onClick={() => avatarImageUrl && generateTryOn(undefined, avatarImageUrl)}
                        disabled={generating || !avatarImageUrl}
                        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm"
                      >
                        <Sparkles className="w-4 h-4 mr-2" /> Try this on my avatar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setTryOnImage(null)}
                        variant="outline"
                        className="w-full h-10 rounded-xl border-primary/25 text-primary font-body text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" /> Back to my avatar
                      </Button>
                    )}

                    <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-body text-xs text-muted-foreground">
                          Saved avatar · {draftGender === "female" ? "Female" : "Male"} · Size {draftSize}
                          {avatar.height_cm ? ` · ${avatar.height_cm} cm` : ""}
                        </p>
                        <button
                          onClick={() => setEditAvatar((v) => !v)}
                          className="font-body text-xs text-primary hover:underline"
                        >
                          {editAvatar ? "Close" : "Modify"}
                        </button>
                      </div>

                      {editAvatar && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {(["female", "male"] as Gender[]).map((g) => (
                              <button
                                key={g}
                                onClick={() => setDraftGender(g)}
                                aria-pressed={draftGender === g}
                                className={`rounded-lg border px-3 py-2 font-body text-xs capitalize transition-colors ${
                                  draftGender === g ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-body text-xs text-muted-foreground">Body size</span>
                              <span className="font-body text-xs font-semibold text-primary">{draftSize}</span>
                            </div>
                            <input
                              type="range" min={0} max={BODY_SIZES.length - 1} step={1}
                              aria-label="Body size"
                              value={BODY_SIZES.indexOf(draftSize)}
                              onChange={(e) => setDraftSize(BODY_SIZES[Number(e.target.value)])}
                              className="w-full accent-primary"
                            />
                          </div>
                          <Button
                            onClick={saveAvatarEdits}
                            disabled={savingAvatar}
                            className="w-full h-9 rounded-lg bg-primary text-primary-foreground font-body text-xs"
                          >
                            {savingAvatar ? "Saving…" : "Save avatar"}
                          </Button>
                          <Button
                            onClick={() => setRebuild(true)}
                            variant="outline"
                            className="w-full h-9 rounded-lg font-body text-xs"
                          >
                            <Camera className="w-3.5 h-3.5 mr-1.5" /> Rebuild from a new photo
                          </Button>
                        </div>
                      )}
                      <p className="font-body text-[11px] text-muted-foreground">
                        Created once — it loads automatically for every future try-on.
                      </p>
                    </div>
                  </>
                ) : (
                  <AvatarBuilder onSaved={() => { reloadAvatar(); setRebuild(false); setMode("avatar"); }} onCancel={() => setMode(null)} compact />
                )}
              </div>
            ) : (
            <>
              {/* Upload section */}
              {!userPhoto ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setMode(null)}
                    className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <p className="font-body text-sm text-foreground font-medium">Upload your photo</p>
                  <p className="font-body text-xs text-muted-foreground">Clear, front-facing photo with good lighting works best.</p>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
                  >
                    <Upload className="w-8 h-8 text-primary mb-2" />
                    <p className="font-body text-sm text-foreground font-medium">Tap to upload</p>
                    <p className="font-body text-xs text-muted-foreground">JPG / PNG · Max 10MB</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => fileInputRef.current?.click()} className="h-10 bg-primary text-primary-foreground rounded-xl font-body text-sm w-full">
                      <Upload className="w-4 h-4 mr-2" /> Gallery
                    </Button>
                    <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="h-10 rounded-xl border-border font-body text-sm w-full">
                      <Camera className="w-4 h-4 mr-2" /> Camera
                    </Button>
                  </div>
                </div>
              ) : !tryOnImage && !generating ? (
                /* Photo uploaded, ready to generate */
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                    <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="font-body text-xs text-foreground font-medium">Photo ready!</p>
                    </div>
                  </div>

                  {/* Color selection */}
                  {product.colors.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" /> Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            title={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c ? "border-foreground scale-110 shadow-sm" : "border-transparent"}`}
                            style={{ backgroundColor: COLOR_PALETTE[c] || "#aaa" }}
                          />
                        ))}
                      </div>
                      {selectedColor && <p className="font-body text-xs text-muted-foreground mt-1">{selectedColor}</p>}
                    </div>
                  )}

                  {/* Privacy */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={deleteAfterProcessing} onChange={(e) => setDeleteAfterProcessing(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="font-body text-xs text-muted-foreground">Delete my image after processing</span>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => generateTryOn()} className="h-11 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm w-full col-span-2">
                      <Sparkles className="w-4 h-4 mr-2" /> Generate Try-On
                    </Button>
                    <Button onClick={() => { removePhoto(); }} variant="outline" className="h-9 rounded-xl border-border text-muted-foreground font-body text-xs w-full">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-upload
                    </Button>
                    <Button onClick={removePhoto} variant="outline" className="h-9 rounded-xl border-destructive/25 text-destructive font-body text-xs w-full">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : generating ? (
                /* Loading with engaging messages */
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-full border-[3px] border-primary/15 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
                    </div>
                    <p className="font-display text-lg font-medium text-foreground text-center mb-1">
                      ✨ Creating Your Look…
                    </p>
                    <p className="font-body text-sm text-primary font-medium text-center min-h-[1.25rem] transition-all">
                      {LOADING_MESSAGES[loadingMsgIndex]}
                    </p>
                  </div>
                  <div className="px-4">
                    <Progress value={progress} className="h-2" />
                    <p className="font-body text-xs text-muted-foreground text-center mt-2">{Math.round(progress)}%</p>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {[0, 120, 240].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              ) : tryOnImage && userPhoto ? (
                /* Result */
                <div className="space-y-4">
                  <BeforeAfterSlider before={userPhoto} after={tryOnImage} />

                  {/* Color variation */}
                  {product.colors.length > 1 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-2 font-medium">Try other colors</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.colors.map((c) => (
                          <button
                            key={c}
                            onClick={() => switchColor(c)}
                            title={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c ? "border-foreground scale-110 shadow-sm" : "border-transparent"}`}
                            style={{ backgroundColor: COLOR_PALETTE[c] || "#aaa" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={downloadLook} variant="outline" className="h-9 rounded-xl border-border text-foreground font-body text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                    <Button
                      onClick={() => { setWishlisted(!wishlisted); toast({ title: wishlisted ? "Removed" : "Saved ❤️" }); }}
                      variant="outline"
                      className="h-9 rounded-xl border-border font-body text-xs"
                    >
                      <Heart className="w-3.5 h-3.5 mr-1" fill={wishlisted ? "currentColor" : "none"} /> Like
                    </Button>
                    <Button
                      onClick={() => { const text = encodeURIComponent(`Check out my virtual try-on of "${product.name}" 🛍️`); window.open(`https://wa.me/?text=${text}`, "_blank"); }}
                      variant="outline"
                      className="h-9 rounded-xl border-border font-body text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                    </Button>
                  </div>

                  <Button onClick={() => { setTryOnImage(null); }} variant="outline" className="w-full h-10 rounded-xl border-primary/25 text-primary font-body text-sm">
                    <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                </div>
              ) : null}
            </>
            )
          )}

          {/* Privacy notice */}
          <div className="flex items-start gap-2 pt-2 border-t border-border">
            <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="font-body text-xs text-muted-foreground">
              Your image is used only for processing and is not stored permanently.
            </p>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileInput} />
      </div>
    </div>
  );
}
