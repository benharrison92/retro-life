-- Add Google Places data to retrospectives table
ALTER TABLE retrospectives 
ADD COLUMN place_id TEXT,
ADD COLUMN place_name TEXT,
ADD COLUMN place_address TEXT,
ADD COLUMN place_rating NUMERIC(2,1),
ADD COLUMN place_user_ratings_total INTEGER,
ADD COLUMN place_types TEXT[],
ADD COLUMN place_photos JSONB DEFAULT '[]'::jsonb;