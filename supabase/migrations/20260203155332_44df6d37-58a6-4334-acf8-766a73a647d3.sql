-- Drop the restrictive policy that's causing the issue
DROP POLICY IF EXISTS "Anyone can register for events" ON public.registrations;

-- Create a permissive policy that allows anyone (including anonymous users) to insert registrations
CREATE POLICY "Anyone can register for events"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_id
    AND e.status = 'published'
    AND e.current_attendees < e.max_attendees
  )
);