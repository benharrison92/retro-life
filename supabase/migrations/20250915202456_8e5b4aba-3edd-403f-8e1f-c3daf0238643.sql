-- Add start_date and end_date columns to trip_planner_items table
ALTER TABLE public.trip_planner_items 
ADD COLUMN start_date date,
ADD COLUMN end_date date;

-- Copy existing scheduled_date to start_date for backward compatibility
UPDATE public.trip_planner_items 
SET start_date = scheduled_date 
WHERE scheduled_date IS NOT NULL;