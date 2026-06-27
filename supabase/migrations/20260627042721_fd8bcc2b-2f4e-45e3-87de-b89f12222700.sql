-- =========================================================
-- merchants: approval, quota, plan columns
-- =========================================================
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS plan_id uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS rate_limit_per_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS monthly_quota integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.merchants ALTER COLUMN status SET DEFAULT 'pending';

-- =========================================================
-- subscription_plans
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  interval text NOT NULL DEFAULT 'month',
  monthly_quota integer NOT NULL DEFAULT 500,
  rate_limit_per_min integer NOT NULL DEFAULT 30,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.merchant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  provider text,
  provider_subscription_id text,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.merchant_subscriptions TO authenticated;
GRANT ALL ON public.merchant_subscriptions TO service_role;
ALTER TABLE public.merchant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.merchant_subscriptions(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'open',
  description text,
  period_start timestamptz,
  period_end timestamptz,
  provider_invoice_id text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.merchant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_members TO authenticated;
GRANT ALL ON public.merchant_members TO service_role;
ALTER TABLE public.merchant_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  merchant_id uuid,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Helper function (after merchant_members exists)
-- =========================================================
CREATE OR REPLACE FUNCTION private.is_merchant_member(_uid uuid, _merchant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.merchants WHERE id = _merchant_id AND owner_user_id = _uid)
      OR EXISTS (SELECT 1 FROM public.merchant_members WHERE merchant_id = _merchant_id AND user_id = _uid AND status = 'active')
      OR private.has_role(_uid, 'super_admin');
$$;

-- =========================================================
-- Policies
-- =========================================================
DROP POLICY IF EXISTS "Admins can view all merchants" ON public.merchants;
CREATE POLICY "Admins can view all merchants" ON public.merchants
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins can update all merchants" ON public.merchants;
CREATE POLICY "Admins can update all merchants" ON public.merchants
  FOR UPDATE TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Members can view their merchant" ON public.merchants;
CREATE POLICY "Members can view their merchant" ON public.merchants
  FOR SELECT TO authenticated USING (private.is_merchant_member(auth.uid(), id));

DROP POLICY IF EXISTS "Admins can view all api keys" ON public.api_keys;
CREATE POLICY "Admins can view all api keys" ON public.api_keys
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins can view all request logs" ON public.tryon_requests;
CREATE POLICY "Admins can view all request logs" ON public.tryon_requests
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
  FOR SELECT USING (is_active OR private.is_admin(auth.uid()));
CREATE POLICY "Admins manage plans" ON public.subscription_plans
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Members and admins view subscriptions" ON public.merchant_subscriptions
  FOR SELECT TO authenticated
  USING (private.is_merchant_member(auth.uid(), merchant_id) OR private.is_admin(auth.uid()));
CREATE POLICY "Admins manage subscriptions" ON public.merchant_subscriptions
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Members and admins view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (private.is_merchant_member(auth.uid(), merchant_id) OR private.is_admin(auth.uid()));
CREATE POLICY "Admins manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE POLICY "Owners and admins view members" ON public.merchant_members
  FOR SELECT TO authenticated
  USING (private.owns_merchant(merchant_id) OR user_id = auth.uid() OR private.is_admin(auth.uid()));
CREATE POLICY "Owners and admins add members" ON public.merchant_members
  FOR INSERT TO authenticated
  WITH CHECK (private.owns_merchant(merchant_id) OR private.is_admin(auth.uid()));
CREATE POLICY "Owners and admins update members" ON public.merchant_members
  FOR UPDATE TO authenticated
  USING (private.owns_merchant(merchant_id) OR private.is_admin(auth.uid()))
  WITH CHECK (private.owns_merchant(merchant_id) OR private.is_admin(auth.uid()));
CREATE POLICY "Owners and admins remove members" ON public.merchant_members
  FOR DELETE TO authenticated
  USING (private.owns_merchant(merchant_id) OR private.is_admin(auth.uid()));

CREATE POLICY "Admins and merchant owners read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR (merchant_id IS NOT NULL AND private.owns_merchant(merchant_id)));

-- =========================================================
-- updated_at triggers
-- =========================================================
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.merchant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_members_updated BEFORE UPDATE ON public.merchant_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Seed default plans
-- =========================================================
INSERT INTO public.subscription_plans (name, slug, price_cents, interval, monthly_quota, rate_limit_per_min, features, sort_order)
VALUES
  ('Starter', 'starter', 0, 'month', 500, 30,
   '["500 try-ons / month","1 website","Community support","Standard AI model"]'::jsonb, 1),
  ('Growth', 'growth', 4900, 'month', 10000, 120,
   '["10,000 try-ons / month","5 websites","Email support","Webhooks","Priority AI queue"]'::jsonb, 2),
  ('Scale', 'scale', 19900, 'month', 100000, 600,
   '["100,000 try-ons / month","Unlimited websites","Priority support","White-label widget","Dedicated AI capacity","SLA"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;