import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, PackageCheck, Sparkles,
  ShieldCheck, Tag, Trash2, Wand2, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";

const STEPS = ["Details", "Imagery", "Variants", "Try-on check", "Publish"] as const;

const CATEGORIES = ["Sarees", "Kurtis", "Lehengas", "Dresses", "Tops", "Shirts", "Kids", "Ethnic sets"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
const RESTRICTED = ["innerwear", "lingerie", "underwear", "swimwear"];

const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  merchantId: string;
  onDone: () => void;
  onCancel: () => void;
}

export default function ProductOnboarding({ merchantId, onDone, onCancel }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [stock, setStock] = useState("10");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [colors, setColors] = useState<string[]>([]);
  const [colorDraft, setColorDraft] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const restricted = RESTRICTED.some((r) => `${category} ${name}`.toLowerCase().includes(r));

  const canNext = () => {
    if (step === 0) return name.trim().length > 1 && category && Number(price) > 0;
    if (step === 1) return !!imageUrl;
    if (step === 2) return sizes.length > 0;
    if (step === 3) return !restricted;
    return true;
  };

  const toggle = (list: string[], v: string, set: (s: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8 MB"); return; }
    setUploading(true);
    const path = `${merchantId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    toast.success("Image ready for try-on");
  };

  const publish = async () => {
    setSaving(true);
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        merchant_id: merchantId,
        name: name.trim(),
        brand: brand.trim() || null,
        category,
        description: description.trim() || null,
        price: Number(price),
        original_price: mrp ? Number(mrp) : null,
        image_url: imageUrl,
        try_on_image_url: imageUrl,
        sizes,
        colors,
        stock_count: Number(stock) || 0,
        in_stock: (Number(stock) || 0) > 0,
      })
      .select("id")
      .single();

    if (error || !product) { toast.error(error?.message ?? "Could not publish"); setSaving(false); return; }

    if (sizes.length) {
      const variants = sizes.flatMap((size) =>
        (colors.length ? colors : [null]).map((color) => ({
          product_id: product.id,
          merchant_id: merchantId,
          size,
          color,
          price: Number(price),
          stock_count: Number(stock) || 0,
          image_url: imageUrl,
        })),
      );
      await supabase.from("product_variants").insert(variants);
    }

    setSaving(false);
    toast.success(`${name} is live with virtual try-on`);
    onDone();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-[var(--shadow-lg)]">
      {/* ambient aura */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full blur-3xl opacity-40"
        style={{ background: "var(--gradient-hero)" }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--gradient-gold)" }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-2 gap-1"><Sparkles className="w-3 h-3" /> Product onboarding</Badge>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Bring a piece into your try-on studio</h2>
            <p className="text-sm text-muted-foreground mt-1">Five calm steps. Your shopper sees it draped on their avatar.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close onboarding"><X className="w-4 h-4" /></Button>
        </div>

        {/* progress rail */}
        <div className="mt-7 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "var(--gradient-hero)" }}
                  initial={false}
                  animate={{ width: i < step ? "100%" : i === step ? "45%" : "0%" }}
                  transition={{ duration: 0.6, ease }}
                />
              </div>
              <div className={`mt-2 text-[11px] tracking-wide ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {i < step ? <Check className="inline w-3 h-3 mr-1" /> : null}{s}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease }}
            >
              {step === 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Product name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ivory Chanderi Saree" />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Your label" />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling price (₹)</Label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="2499" />
                  </div>
                  <div className="space-y-2">
                    <Label>MRP (₹, optional)</Label>
                    <Input value={mrp} onChange={(e) => setMrp(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="3499" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input value={stock} onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <motion.button
                          key={c} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                          onClick={() => setCategory(c)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            category === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background/60 hover:border-primary/50"
                          }`}
                        >{c}</motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Fabric, drape, occasion…" />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 items-start">
                  <motion.div whileHover={{ scale: 1.005 }} className="relative">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                    <button
                      type="button" onClick={() => fileRef.current?.click()}
                      className="group relative w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-background/50 overflow-hidden transition-colors"
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={name || "Product image"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center gap-2 text-muted-foreground">
                          {uploading ? <Loader2 className="w-7 h-7 animate-spin text-primary" /> : <ImagePlus className="w-7 h-7 text-primary" />}
                          <span className="text-sm">{uploading ? "Uploading…" : "Upload the garment photo"}</span>
                          <span className="text-[11px]">PNG or JPG · flat-lay or on-model · under 8 MB</span>
                        </div>
                      )}
                      <motion.div
                        aria-hidden className="pointer-events-none absolute inset-0"
                        style={{ background: "var(--gradient-shimmer)" }}
                        animate={{ x: ["-120%", "120%"] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                      />
                    </button>
                    {imageUrl && (
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setImageUrl(null)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Replace
                      </Button>
                    )}
                  </motion.div>
                  <Card className="p-5 bg-background/60 border-border/60">
                    <h3 className="font-semibold text-sm flex items-center gap-2"><Wand2 className="w-4 h-4 text-primary" /> What makes try-on look perfect</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {["Full garment visible, no crop", "Even light, no harsh shadows", "Plain background works best", "Sharp focus on fabric texture", "One garment per product"].map((t, i) => (
                        <motion.li key={t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }} className="flex gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{t}
                        </motion.li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Sizes offered</Label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => (
                        <motion.button key={s} type="button" whileTap={{ scale: 0.94 }} whileHover={{ y: -2 }}
                          onClick={() => toggle(sizes, s, setSizes)}
                          className={`h-10 w-12 rounded-xl text-xs border transition-colors ${
                            sizes.includes(s) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background/60 hover:border-primary/50"
                          }`}
                        >{s}</motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Colourways</Label>
                    <div className="flex gap-2">
                      <Input value={colorDraft} onChange={(e) => setColorDraft(e.target.value)}
                        placeholder="Ivory, Emerald…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && colorDraft.trim()) {
                            e.preventDefault();
                            setColors([...new Set([...colors, colorDraft.trim()])]);
                            setColorDraft("");
                          }
                        }} />
                      <Button variant="secondary" onClick={() => { if (colorDraft.trim()) { setColors([...new Set([...colors, colorDraft.trim()])]); setColorDraft(""); } }}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <AnimatePresence>
                        {colors.map((c) => (
                          <motion.span key={c} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setColors(colors.filter((x) => x !== c))}>
                              <Tag className="w-3 h-3" />{c}<X className="w-3 h-3" />
                            </Badge>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {sizes.length * Math.max(colors.length, 1)} variants will be created.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { ok: !!imageUrl, label: "Try-on reference image attached" },
                    { ok: !restricted, label: "Category allowed for virtual try-on" },
                    { ok: sizes.length > 0, label: "At least one size mapped" },
                    { ok: Number(price) > 0, label: "Price set for checkout" },
                  ].map((c, i) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <Card className={`p-4 border-border/60 bg-background/60 flex items-center gap-3 ${c.ok ? "" : "border-destructive/50"}`}>
                        <span className={`grid place-items-center h-8 w-8 rounded-full ${c.ok ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                          {c.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </span>
                        <span className="text-sm">{c.label}</span>
                      </Card>
                    </motion.div>
                  ))}
                  <Card className="md:col-span-2 p-4 bg-secondary/40 border-border/60 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Shopper photos are never stored — try-ons are generated in the moment and discarded. Innerwear and swimwear stay out of virtual try-on by policy.
                    </p>
                  </Card>
                </div>
              )}

              {step === 4 && (
                <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}
                    className="rounded-2xl overflow-hidden border border-border/60 bg-background/60 aspect-[4/5]">
                    {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : null}
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{name || "Untitled piece"}</h3>
                    <p className="text-sm text-muted-foreground">{brand || "—"} · {category || "—"}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">₹{price || 0}</span>
                      {mrp && <span className="text-sm text-muted-foreground line-through">₹{mrp}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                      {colors.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground">{description || "No description yet."}</p>
                    <div className="flex items-center gap-2 text-sm text-primary"><PackageCheck className="w-4 h-4" /> Ready to publish with try-on enabled</div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button disabled={saving} onClick={publish}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
              Publish product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
