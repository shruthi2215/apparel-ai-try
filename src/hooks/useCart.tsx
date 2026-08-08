import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics";

export interface CartItem {
  id: string;
  product_id: string | null;
  merchant_id: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number | null;
}

interface AddToCartInput {
  productId?: string | null;
  merchantId?: string | null;
  productName?: string;
  category?: string;
  size?: string | null;
  color?: string | null;
  price?: number;
  quantity?: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, merchant_id, quantity, size, color, price")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as CartItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const addToCart = useCallback(async (input: AddToCartInput) => {
    if (!user) return { error: "not_authenticated" as const };
    const productId = input.productId && UUID_RE.test(input.productId) ? input.productId : null;

    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      merchant_id: input.merchantId ?? null,
      quantity: input.quantity ?? 1,
      size: input.size ?? null,
      color: input.color ?? null,
      price: input.price ?? null,
    });
    if (error) return { error: error.message };

    track({
      event_type: "cart_add",
      merchant_id: input.merchantId ?? null,
      product_id: input.productId ?? null,
      product_name: input.productName,
      category: input.category,
      size: input.size,
      color: input.color,
      value_cents: input.price ? Math.round(input.price * 100) : null,
    });
    await refresh();
    return {};
  }, [user, refresh]);

  const removeFromCart = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    await supabase.from("cart_items").delete().eq("id", id);
    track({ event_type: "cart_remove", merchant_id: item?.merchant_id ?? null, product_id: item?.product_id ?? null });
    await refresh();
  }, [items, refresh]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
    await refresh();
  }, [refresh, removeFromCart]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0);

  return { items, count, total, loading, addToCart, removeFromCart, updateQuantity, refresh };
}
