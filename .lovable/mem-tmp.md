---
name: Multi-tenant SaaS data layer
description: Tenant isolation, event tracking and usage/cost recording powering all TRYVIOR dashboards
type: feature
---
Every merchant-owned record carries `merchant_id`; RLS uses `private.is_admin`, `private.has_role` and `private.is_merchant_member` — a merchant can never read another merchant's rows.

Core tables: products/orders/wishlists/try_on_sessions (merchant-tagged), product_variants, cart_items, analytics_events, usage_records, notifications, support_tickets, user_measurements.

Event tracking: all funnel metrics derive from `analytics_events` via `src/lib/analytics.ts` (`track`/`trackEvent`). Event types: product_view, tryon_started/completed/failed, avatar_created/failed, wishlist_add/remove, cart_add/remove, checkout_started, purchase.

Cost/usage: `supabase/functions/_shared/usage.ts` writes `usage_records` server-side with AI_COST_CENTS (tryon 7c, avatar 9c) for margin and quota math. Clients can insert events but never edit or delete them.

Analytics rule: NO fake/mock analytics. Charts read the database and show empty states until real events exist.
