-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;

-- Create a new policy that only allows admins to view registrations
CREATE POLICY "Admins can view registrations" 
ON public.registrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));