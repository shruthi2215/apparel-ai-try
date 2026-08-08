-- =============== tenant tagging ===============
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL;
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE;
ALTER TABLE public.try_on_sessions ADD COLUMN IF NOT EXISTS merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_merchant ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_merchant ON public.wishlists(merchant_id);
CREATE INDEX IF NOT EXISTS idx_tos_merchant ON public.try_on_sessions(merchant_id);

-- =============== product variants ===============
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  sku text,
  size text,
  color text,
  price numeric,
  stock_count integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "variants merchant write" ON public.product_variants FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)))
  WITH CHECK (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== cart ===============
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  color text,
  price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_merchant ON public.cart_items(merchant_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart own manage" ON public.cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart merchant read" ON public.cart_items FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));
CREATE TRIGGER trg_cart_updated BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== analytics events ===============
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  category text,
  color text,
  size text,
  status text,
  duration_ms integer,
  device_type text,
  country text,
  value_cents integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_merchant_time ON public.analytics_events(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_product ON public.analytics_events(product_id);
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events insert own" ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "events read own" ON public.analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "events read tenant" ON public.analytics_events FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));

-- =============== usage records ===============
CREATE TABLE IF NOT EXISTS public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id uuid,
  usage_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  cost_cents numeric NOT NULL DEFAULT 0,
  provider text,
  model text,
  status text NOT NULL DEFAULT 'success',
  latency_ms integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_merchant_time ON public.usage_records(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_type ON public.usage_records(usage_type, created_at DESC);
GRANT SELECT ON public.usage_records TO authenticated;
GRANT ALL ON public.usage_records TO service_role;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage read tenant" ON public.usage_records FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));

-- =============== notifications ===============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  audience text NOT NULL DEFAULT 'user',
  severity text NOT NULL DEFAULT 'info',
  category text,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_merchant ON public.notifications(merchant_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif read tenant" ON public.notifications FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));
CREATE POLICY "notif mark read own" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif mark read tenant" ON public.notifications FOR UPDATE TO authenticated
  USING (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id))
  WITH CHECK (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id));

-- =============== support tickets ===============
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  created_by uuid,
  requester_email text,
  subject text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tickets_merchant ON public.support_tickets(merchant_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets create own" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "tickets read own" ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = created_by);
CREATE POLICY "tickets read tenant" ON public.support_tickets FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));
CREATE POLICY "tickets update tenant" ON public.support_tickets FOR UPDATE TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)))
  WITH CHECK (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.is_merchant_member(auth.uid(), merchant_id)));
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== user measurements ===============
CREATE TABLE IF NOT EXISTS public.user_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  height_cm integer,
  weight_kg integer,
  preferred_size text,
  bust_cm integer,
  waist_cm integer,
  hip_cm integer,
  shoulder_cm integer,
  inseam_cm integer,
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_measurements TO authenticated;
GRANT ALL ON public.user_measurements TO service_role;
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurements own manage" ON public.user_measurements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_measurements_updated BEFORE UPDATE ON public.user_measurements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();