-- Drop the restrictive policy
DROP POLICY IF EXISTS "Anyone can register for events" ON public.registrations;

-- Create a PERMISSIVE policy (using AS PERMISSIVE explicitly)
CREATE POLICY "Anyone can register for events"
ON public.registrations
AS PERMISSIVE
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