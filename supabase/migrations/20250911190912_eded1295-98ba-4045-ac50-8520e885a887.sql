-- Add Google Places data to catalogue_items table
ALTER TABLE public.catalogue_items 
ADD COLUMN place_id text,
ADD COLUMN place_name text,
ADD COLUMN place_address text,
ADD COLUMN place_rating numeric,
ADD COLUMN place_user_ratings_total integer,
ADD COLUMN place_types text[];