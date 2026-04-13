-- Add current_signups counter to staff_events
ALTER TABLE public.staff_events ADD COLUMN IF NOT EXISTS current_signups INTEGER NOT NULL DEFAULT 0;

-- Trigger function to update count
CREATE OR REPLACE FUNCTION public.update_staff_event_signup_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.staff_events
    SET current_signups = current_signups + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.staff_events
    SET current_signups = GREATEST(0, current_signups - 1)
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_staff_signup_insert
  AFTER INSERT ON public.staff_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_event_signup_count();

CREATE TRIGGER on_staff_signup_delete
  AFTER DELETE ON public.staff_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_event_signup_count();
