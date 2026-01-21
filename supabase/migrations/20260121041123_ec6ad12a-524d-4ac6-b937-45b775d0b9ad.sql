-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP requests (needed by cron)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule daily cleanup job at 03:00 to delete registrations 
-- for events that occurred more than 15 days ago (GDPR compliance)
SELECT cron.schedule(
  'gdpr-cleanup-old-registrations',
  '0 3 * * *',
  $$
  DELETE FROM public.registrations
  WHERE event_id IN (
    SELECT id FROM public.events
    WHERE date < CURRENT_DATE - INTERVAL '15 days'
  );
  $$
);