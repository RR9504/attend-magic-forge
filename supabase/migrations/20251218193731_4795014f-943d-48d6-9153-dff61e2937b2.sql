-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  max_attendees INTEGER NOT NULL DEFAULT 50,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Events: Anyone can read published events
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (status = 'published');

-- Events: Authenticated users can manage events (for admin dashboard)
CREATE POLICY "Authenticated users can manage events"
ON public.events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Registrations: Anyone can read registrations (needed for count)
CREATE POLICY "Anyone can view registrations"
ON public.registrations
FOR SELECT
USING (true);

-- Registrations: Anyone can insert registrations (public signup)
CREATE POLICY "Anyone can register for events"
ON public.registrations
FOR INSERT
WITH CHECK (true);

-- Registrations: Authenticated users can delete registrations (admin)
CREATE POLICY "Authenticated users can delete registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (true);

-- Create function to update attendee count
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET current_attendees = GREATEST(0, current_attendees - 1) 
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER on_registration_insert
  AFTER INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendee_count();

CREATE TRIGGER on_registration_delete
  AFTER DELETE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_attendee_count();

-- Create index for faster lookups
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);