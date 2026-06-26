# TryOnMe SaaS Integration — Phase 1

The full spec describes a large platform. I'll build it in phases so each piece is solid and shippable. **Phase 1 (this plan)** delivers the end-to-end integration loop a merchant actually needs; later phases add billing, more dashboards, and native SDKs.

## What Phase 1 delivers

1. **Secure REST API** (`/functions/v1/tryon-api`)
   - Auth via merchant **API key** (`Authorization: Bearer tom_live_...`).
   - Accepts: `userImage` (base64/data URL), `productImageUrl`, `productId`, `merchantId`, optional `sessionId`.
   - Returns: `{ requestId, status, imageUrl, error? }`.
   - Reuses the existing strict garment-preservation AI pipeline (`ai-tryon-image`).
   - Logs every call (status, latency, product) for analytics. Does **not** persist user photos (only processes in-memory) — honors the privacy rule.

2. **JavaScript SDK / Widget** (`public/sdk/tryonme.js`, served from the app domain)
   - One script + `TryOnMe.init({ apiKey, merchantId })`.
   - Auto-adds a **Try On** button on `img[data-tryon]` (and optional auto-detect of product image).
   - Opens an **in-page popup** (no redirect): upload photo, camera capture, preview, remove/retake, progress + AI processing animation, result preview, download, share, "try another photo".
   - Calls the REST API directly and renders the result inside the popup.

3. **Merchant Dashboard** (`/merchant`)
   - Generate / revoke API keys (shown once, stored hashed).
   - Analytics: total / successful / failed try-ons, avg processing time, most-tried products, daily usage.
   - Copy-paste install snippet.

4. **API Docs page** (`/docs/api`)
   - Auth, endpoints, example request/response, SDK install, error codes, rate-limit notes.

## Database (new tables, all with RLS + GRANTs)

```text
merchants        - id, owner_user_id, name, status (pending/active/suspended), created_at
api_keys         - id, merchant_id, key_prefix, key_hash, name, last_used_at, revoked, created_at
tryon_requests   - id, merchant_id, product_id, status (success/failed),
                   latency_ms, error_code, request_id, created_at
```

- `merchants`: owner can read/update own; super_admin all.
- `api_keys`: owner of merchant can manage own keys (hash never returned after creation).
- `tryon_requests`: owner reads own rows; edge function (service role) inserts.
- API-key verification happens **inside the edge function** with the service role (keys are hashed with SHA-256; the raw key is shown to the merchant only at creation).

## Security included now
- API-key auth (hashed at rest, prefix-identified).
- HTTPS + CORS (already enforced by platform).
- No permanent storage of user photos (in-memory processing only).
- Role-based access via existing `user_roles` (`super_admin`/`admin`/`user`) + per-merchant ownership.
- Request audit log via `tryon_requests`.

## Explicitly deferred (later phases — noted so scope is clear)
- Billing / invoices / subscriptions / plan management (needs payments enablement).
- Full Super Admin console (approve/suspend, revenue, system health, AI model mgmt) — Phase 2 builds on the same tables.
- Team members, webhooks, announcements, support tickets.
- Native SDKs (React/Next/Flutter/Android/iOS) and platform plugins (Shopify/Woo/Magento/WordPress).
- Queue/async processing, microservices, Docker/K8s/AWS infra, multi-language, white-label.
- Backend rate limiting: the platform has no standard rate-limit primitive; I'll document limits but not enforce server-side unless you confirm you want an ad-hoc limiter.

## Technical notes
- New edge function `tryon-api` (verify_jwt = false; validates API key in code).
- SDK served as a static file from the app (`/sdk/tryonme.js`) — the `cdn.tryonme.ai` URL would just be a future CNAME to this.
- Categories: the AI prompt is already garment-agnostic and category-aware; I'll pass `productCategory` through so sarees/kurtis/etc. drape correctly.

If this scope looks right, I'll start with the database migration, then the API, SDK, and dashboard.