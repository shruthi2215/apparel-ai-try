import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Boxes, Loader2, Plus, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import ProductOnboarding from "./ProductOnboarding";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  in_stock: boolean;
  stock_count: number | null;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function CatalogTab({ merchantId }: { merchantId: string }) {
  const [items, setItems] = useState<Product[]>([]);
  const [busy, setBusy] = useState(true);
  const [wizard, setWizard] = useState(false);

  const load = async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("products")
      .select("id,name,brand,category,price,original_price,image_url,sizes,colors,in_stock,stock_count")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as Product[]);
    setBusy(false);
  };

  useEffect(() => { load(); }, [merchantId]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product removed");
    load();
  };

  if (wizard) {
    return (
      <ProductOnboarding
        merchantId={merchantId}
        onCancel={() => setWizard(false)}
        onDone={() => { setWizard(false); load(); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Catalog</h2>
          <p className="text-sm text-muted-foreground">Every piece here is try-on ready for your shoppers.</p>
        </div>
        <Button onClick={() => setWizard(true)}><Plus className="w-4 h-4 mr-1" /> Onboard product</Button>
      </div>

      {busy ? (
        <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-2xl p-10 md:p-14 text-center"
        >
          <motion.div
            aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--gradient-hero)" }}
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative">
            <motion.div
              className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-primary/12 text-primary"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Boxes className="w-7 h-7" />
            </motion.div>
            <h3 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight">A clean, empty rail</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Onboard your first garment and it becomes wearable on any shopper's avatar in five guided steps.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              {["Details", "Imagery", "Variants", "Try-on check", "Publish"].map((s, i) => (
                <motion.span key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                  className="px-3 py-1.5 rounded-full border border-border bg-background/60">{s}</motion.span>
              ))}
            </div>
            <Button className="mt-7" size="lg" onClick={() => setWizard(true)}>
              <Sparkles className="w-4 h-4 mr-1" /> Onboard your first product
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {items.map((p, i) => (
              <motion.div key={p.id} layout
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease, delay: Math.min(i * 0.04, 0.3) }}
                whileHover={{ y: -6 }}
              >
                <Card className="group overflow-hidden border-border/60 bg-card/70 backdrop-blur-xl h-full flex flex-col">
                  <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="grid place-items-center h-full text-muted-foreground"><ShoppingBag className="w-6 h-6" /></div>
                    )}
                    <Badge className="absolute top-2 left-2 gap-1" variant="secondary"><Sparkles className="w-3 h-3" /> Try-on</Badge>
                    {!p.in_stock && <Badge className="absolute top-2 right-2" variant="destructive">Out of stock</Badge>}
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-1">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand || "—"} · {p.category}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-semibold">₹{Number(p.price).toLocaleString("en-IN")}</span>
                      {p.original_price && <span className="text-xs text-muted-foreground line-through">₹{Number(p.original_price).toLocaleString("en-IN")}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(p.sizes ?? []).slice(0, 5).map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                    <Button variant="ghost" size="sm" className="mt-auto self-start text-destructive hover:text-destructive"
                      onClick={() => remove(p.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
