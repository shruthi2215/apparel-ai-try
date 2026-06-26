-- Merchants
CREATE TABLE public.merchants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchants TO authenticated;
GRANT ALL ON public.merchants TO service_role;

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own merchants"
  ON public.merchants FOR SELECT TO authenticated
  USING (auth.uid() = owner_user_id OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owners can create merchants"
  ON public.merchants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update own merchants"
  ON public.merchants FOR UPDATE TO authenticated
  USING (auth.uid() = owner_user_id OR private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = owner_user_id OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owners can delete own merchants"
  ON public.merchants FOR DELETE TO authenticated
  USING (auth.uid() = owner_user_id OR private.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: does the current user own this merchant?
CREATE OR REPLACE FUNCTION public.owns_merchant(_merchant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchants
    WHERE id = _merchant_id AND owner_user_id = auth.uid()
  ) OR private.has_role(auth.uid(), 'super_admin')
$$;

REVOKE ALL ON FUNCTION public.owns_merchant(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.owns_merchant(uuid) TO authenticated;

-- API keys
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name text,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  last_used_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own api keys"
  ON public.api_keys FOR SELECT TO authenticated
  USING (public.owns_merchant(merchant_id));

CREATE POLICY "Owners can create api keys"
  ON public.api_keys FOR INSERT TO authenticated
  WITH CHECK (public.owns_merchant(merchant_id));

CREATE POLICY "Owners can update own api keys"
  ON public.api_keys FOR UPDATE TO authenticated
  USING (public.owns_merchant(merchant_id))
  WITH CHECK (public.owns_merchant(merchant_id));

CREATE POLICY "Owners can delete own api keys"
  ON public.api_keys FOR DELETE TO authenticated
  USING (public.owns_merchant(merchant_id));

CREATE INDEX idx_api_keys_prefix ON public.api_keys (key_prefix) WHERE revoked = false;
CREATE INDEX idx_api_keys_merchant ON public.api_keys (merchant_id);

-- Try-on request log
CREATE TABLE public.tryon_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  request_id text NOT NULL,
  product_id text,
  product_name text,
  status text NOT NULL,
  latency_ms integer,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tryon_requests TO authenticated;
GRANT ALL ON public.tryon_requests TO service_role;

ALTER TABLE public.tryon_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own request logs"
  ON public.tryon_requests FOR SELECT TO authenticated
  USING (public.owns_merchant(merchant_id));

CREATE INDEX idx_tryon_requests_merchant ON public.tryon_requests (merchant_id, created_at DESC);