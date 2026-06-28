
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS gstin text;

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS period_days integer NOT NULL DEFAULT 30;

UPDATE public.subscription_plans
  SET period_days = CASE WHEN interval = 'year' THEN 365 ELSE 30 END;

ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS expiry_alert_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON public.api_keys (expires_at) WHERE revoked = false;
