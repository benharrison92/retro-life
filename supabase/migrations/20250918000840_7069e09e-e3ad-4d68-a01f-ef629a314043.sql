-- Add tags column to trip_planner_items table
ALTER TABLE trip_planner_items 
ADD COLUMN tags text[] DEFAULT '{}';

-- Create an index for better performance when filtering by tags
CREATE INDEX idx_trip_planner_items_tags ON trip_planner_items USING GIN(tags);