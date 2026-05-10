import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TryOnModal from "@/components/TryOnModal";
import {
  Search, Heart, ShoppingCart, Sparkles, Star, TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Sarees", "Kurtis", "Dresses", "Shirts", "Kids Wear", "Accessories"];
const MOCK_PRODUCTS = [
  { id: "1", name: "Floral Anarkali Kurti", category: "Kurtis", price: 1299, original_price: 1999, brand: "Biba", rating: 4.5, reviews_count: 128, is_trending: true, in_stock: true, colors: ["Rose", "Blue", "Green"], sizes: ["S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop", tags: ["trending","summer"] },
  { id: "2", name: "Banarasi Silk Saree", category: "Sarees", price: 4999, original_price: 7500, brand: "FabIndia", rating: 4.8, reviews_count: 89, is_trending: true, in_stock: true, colors: ["Red", "Gold", "Purple"], sizes: ["Free Size"], image_url: "https://images.unsplash.com/photo-1610189351021-ef7c9e47c7e2?w=400&h=500&fit=crop", tags: ["wedding","festive"] },
  { id: "3", name: "Cotton Floral Dress", category: "Dresses", price: 1599, original_price: 2299, brand: "Zara India", rating: 4.3, reviews_count: 67, is_trending: false, in_stock: true, colors: ["White", "Pink", "Yellow"], sizes: ["XS","S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", tags: ["casual","summer"] },
  { id: "4", name: "Classic Linen Shirt", category: "Shirts", price: 899, original_price: 1299, brand: "Allen Solly", rating: 4.2, reviews_count: 201, is_trending: false, in_stock: true, colors: ["White", "Blue", "Beige"], sizes: ["S","M","L","XL","XXL"], image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop", tags: ["formal","office"] },
  { id: "5", name: "Embroidered Lehenga", category: "Sarees", price: 8999, original_price: 14000, brand: "Manyavar", rating: 4.9, reviews_count: 45, is_trending: true, in_stock: true, colors: ["Maroon", "Navy", "Pink"], sizes: ["S","M","L"], image_url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400&h=500&fit=crop", tags: ["bridal","wedding"] },
  { id: "6", name: "Kids Ethnic Set", category: "Kids Wear", price: 799, original_price: 1099, brand: "FabKids", rating: 4.4, reviews_count: 156, is_trending: false, in_stock: true, colors: ["Orange", "Green"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], image_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop", tags: ["festive","kids"] },
  { id: "7", name: "Chikankari Kurti", category: "Kurtis", price: 1899, original_price: 2499, brand: "W for Woman", rating: 4.6, reviews_count: 93, is_trending: true, in_stock: true, colors: ["Off-White", "Peach", "Mint"], sizes: ["S","M","L","XL"], image_url: "https://images.unsplash.com/photo-1553659971-f01207815844?w=400&h=500&fit=crop", tags: ["lucknowi","ethnic"] },
  { id: "8", name: "Palazzo Set", category: "Dresses", price: 1199, original_price: 1799, brand: "Max Fashion", rating: 4.1, reviews_count: 178, is_trending: false, in_stock: true, colors: ["Black", "Teal", "Purple"], sizes: ["S","M","L","XL","XXL"], image_url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop", tags: ["comfortable","everyday"] },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [tryOnProduct, setTryOnProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [dbProducts, setDbProducts] = useState<typeof MOCK_PRODUCTS>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price) || 0,
          original_price: p.original_price ? Number(p.original_price) : undefined,
          brand: p.brand || "—",
          rating: Number(p.rating) || 0,
          reviews_count: p.reviews_count || 0,
          is_trending: !!p.is_trending,
          in_stock: !!p.in_stock,
          colors: p.colors || [],
          sizes: p.sizes || [],
          image_url: p.image_url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=500&fit=crop",
          tags: p.tags || [],
        })) as typeof MOCK_PRODUCTS;
        setDbProducts(mapped);
      });
  }, []);

  const ALL_PRODUCTS = [...dbProducts, ...MOCK_PRODUCTS];
  const filtered = ALL_PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleWishlist = (productId: string) => {
    if (!user) { navigate("/auth"); return; }
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) { next.delete(productId); toast({ title: "Removed from wishlist" }); }
      else { next.add(productId); toast({ title: "Added to wishlist ❤️" }); }
      return next;
    });
  };

  const handleTryOn = (product: typeof MOCK_PRODUCTS[0]) => {
    if (!user) { navigate("/auth"); return; }
    setTryOnProduct(product);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Browse <span className="gradient-gold-text">Products</span>
            </h1>
            <p className="font-body text-muted-foreground text-lg">Explore our curated fashion collection for all occasions</p>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 bg-white/5 border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-body text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-hero text-white shadow-brand"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {activeCategory === "All" && (
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-body text-sm text-muted-foreground">Showing {filtered.length} products</span>
            </div>
          )}

          {/* Product Grid - vertical layout, mobile friendly */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="glass-card rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.is_trending && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-hero text-white text-xs font-body font-semibold">
                      Trending
                    </div>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full glass-card flex items-center justify-center transition-colors ${
                      wishlist.has(product.id) ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={wishlist.has(product.id) ? "currentColor" : "none"} />
                  </button>

                  {/* Floating "Try it on" pill button overlay (like marketplace integrations) */}
                  <button
                    onClick={() => handleTryOn(product)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-900 text-xs font-body font-semibold shadow-lg hover:scale-105 transition-transform whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Try it on
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-body text-xs text-muted-foreground mb-0.5">{product.brand}</p>
                  <h3 className="font-body text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <span className="font-body text-xs text-foreground/70">{product.rating} ({product.reviews_count})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-body text-sm font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                    {product.original_price && (
                      <span className="font-body text-xs line-through text-muted-foreground">₹{product.original_price.toLocaleString()}</span>
                    )}
                  </div>
                  {/* Try On Me button */}
                  <Button
                    onClick={() => handleTryOn(product)}
                    className="w-full h-9 text-xs bg-gradient-hero text-white border-0 rounded-lg font-body font-semibold hover:scale-105 transition-transform shadow-brand"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" /> Try On Me
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-1.5 mt-1.5">
                    <Button
                      variant="outline"
                      className="flex-1 h-7 text-xs rounded-lg border-white/10 text-muted-foreground hover:text-foreground font-body"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" /> Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-7 text-xs rounded-lg border-white/10 text-muted-foreground hover:text-foreground font-body"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground text-lg">No products found for "{search}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Try-On Modal */}
      {tryOnProduct && (
        <TryOnModal
          open={!!tryOnProduct}
          onClose={() => setTryOnProduct(null)}
          product={tryOnProduct}
        />
      )}

      <Footer />
    </div>
  );
}
