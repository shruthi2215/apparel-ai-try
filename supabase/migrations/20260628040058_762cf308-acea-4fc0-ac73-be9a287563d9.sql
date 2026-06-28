-- Ensure merchant registration + key expiry columns exist (idempotent).
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS gstin text;

ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS expiry_alert_sent_at timestamptz;

ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS period_days integer NOT NULL DEFAULT 30;

-- Schedule the daily expiry check (07:00 UTC) via pg_cron + pg_net.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-api-keys-daily') THEN
    PERFORM cron.unschedule('expire-api-keys-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-api-keys-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vonppkdllfzztpibtewy.supabase.co/functions/v1/expire-api-keys',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('source', 'cron')
  );
  $$
);