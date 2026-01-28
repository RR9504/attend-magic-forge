-- Add image_position column to events table for storing the focal point of event images
ALTER TABLE public.events 
ADD COLUMN image_position jsonb DEFAULT '{"x": 50, "y": 50}'::jsonb;