-- Add column to control visibility of booked seats count on public page
ALTER TABLE public.events 
ADD COLUMN show_booked_seats boolean NOT NULL DEFAULT true;