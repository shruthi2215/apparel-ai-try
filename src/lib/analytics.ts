/**
 * TRYVIOR analytics event tracking.
 *
 * Single service abstraction over the `analytics_events` table. Every dashboard
 * metric, funnel and chart is derived from these events — no mock analytics.
 * Swapping in an external provider later only requires changing `dispatch`.
 */
import { supabase } from "@/integrations/supabase/client";

export type TryviorEventType =
  | "product_view"
  | "tryon_started"
  | "tryon_completed"
  | "tryon_failed"
  | "avatar_created"
  | "avatar_failed"
  | "wishlist_add"
  | "wishlist_remove"
  | "cart_add"
  | "cart_remove"
  | "checkout_started"
  | "purchase";

export interface TryviorEvent {
  event_type: TryviorEventType;
  merchant_id?: string | null;
  product_id?: string | null;
  product_name?: string | null;
  category?: string | null;
  color?: string | null;
  size?: string | null;
  status?: string | null;
  duration_ms?: number | null;
  value_cents?: number | null;
  metadata?: Record<string, unknown>;
}

const SESSION_KEY = "tryvior_session_id";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = typeof window === "undefined" ? 1280 : window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function country(): string | null {
  try {
    const locale = navigator.language || "";
    const region = locale.split("-")[1];
    return region ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** Only UUIDs are accepted by the product_id FK; demo catalog ids are kept in metadata. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function trackEvent(event: TryviorEvent): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const isUuid = !!event.product_id && UUID_RE.test(event.product_id);

    await supabase.from("analytics_events").insert({
      event_type: event.event_type,
      user_id: user?.id ?? null,
      merchant_id: event.merchant_id ?? null,
      session_id: sessionId(),
      product_id: isUuid ? event.product_id : null,
      product_name: event.product_name ?? null,
      category: event.category ?? null,
      color: event.color ?? null,
      size: event.size ?? null,
      status: event.status ?? null,
      duration_ms: event.duration_ms ?? null,
      value_cents: event.value_cents ?? null,
      device_type: deviceType(),
      country: country(),
      metadata: {
        ...(event.metadata ?? {}),
        ...(event.product_id && !isUuid ? { external_product_id: event.product_id } : {}),
      },
    });
  } catch {
    // Analytics must never break the user experience.
  }
}

/** Fire-and-forget helper for UI handlers. */
export function track(event: TryviorEvent): void {
  void trackEvent(event);
}
