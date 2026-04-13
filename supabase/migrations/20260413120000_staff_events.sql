-- ============================================================
-- Internal Staff Events — personalbemanningssystem
-- ============================================================

-- 1. Staff events
CREATE TABLE public.staff_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  staff_needed INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staff_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view open staff events (intern page is public within org)
CREATE POLICY "Anyone can view staff events"
  ON public.staff_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage staff events"
  ON public.staff_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 2. Staff signups
CREATE TABLE public.staff_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.staff_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  signed_up_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.staff_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can sign up (internal page, no auth required)
CREATE POLICY "Anyone can sign up for staff events"
  ON public.staff_signups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_events
      WHERE staff_events.id = staff_signups.event_id
      AND staff_events.status = 'open'
    )
  );

-- Admins can view and delete signups
CREATE POLICY "Admins can view staff signups"
  ON public.staff_signups FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete staff signups"
  ON public.staff_signups FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Index for faster lookups
CREATE INDEX idx_staff_signups_event_id ON public.staff_signups(event_id);
