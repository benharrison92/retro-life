-- Create trip planner tables for itinerary management

-- Create enum types for trip planner
CREATE TYPE public.event_type AS ENUM ('accommodation', 'travel', 'activity', 'food', 'other');
CREATE TYPE public.trip_status AS ENUM ('booked', 'pending_review', 'declined');

-- Create trip planner table
CREATE TABLE public.trip_planners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalogue_id UUID REFERENCES public.catalogues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_planners ENABLE ROW LEVEL SECURITY;

-- Trip planner RLS policies
CREATE POLICY "Users can create their own trip planners"
ON public.trip_planners FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own trip planners"
ON public.trip_planners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip planners"
ON public.trip_planners FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip planners"
ON public.trip_planners FOR DELETE
USING (auth.uid() = user_id);

-- Create trip planner items table
CREATE TABLE public.trip_planner_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_planner_id UUID NOT NULL REFERENCES public.trip_planners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  catalogue_item_id UUID REFERENCES public.catalogue_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type public.event_type NOT NULL DEFAULT 'other',
  status public.trip_status NOT NULL DEFAULT 'pending_review',
  scheduled_date DATE,
  scheduled_time TIME,
  location_name TEXT,
  location_address TEXT,
  estimated_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_planner_items ENABLE ROW LEVEL SECURITY;

-- Trip planner items RLS policies
CREATE POLICY "Users can create items for their trip planners"
ON public.trip_planner_items FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.trip_planners 
    WHERE id = trip_planner_items.trip_planner_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view items for their trip planners"
ON public.trip_planner_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_planners 
    WHERE id = trip_planner_items.trip_planner_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items for their trip planners"
ON public.trip_planner_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trip_planners 
    WHERE id = trip_planner_items.trip_planner_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items for their trip planners"
ON public.trip_planner_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trip_planners 
    WHERE id = trip_planner_items.trip_planner_id 
    AND user_id = auth.uid()
  )
);

-- Create trip planner discussions table
CREATE TABLE public.trip_planner_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_planner_item_id UUID NOT NULL REFERENCES public.trip_planner_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  tagged_user_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_planner_discussions ENABLE ROW LEVEL SECURITY;

-- Trip planner discussions RLS policies
CREATE POLICY "Users can create discussions for trip planner items they have access to"
ON public.trip_planner_discussions FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.trip_planner_items tpi
    JOIN public.trip_planners tp ON tpi.trip_planner_id = tp.id
    WHERE tpi.id = trip_planner_discussions.trip_planner_item_id 
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view discussions for trip planner items they have access to"
ON public.trip_planner_discussions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_planner_items tpi
    JOIN public.trip_planners tp ON tpi.trip_planner_id = tp.id
    WHERE tpi.id = trip_planner_discussions.trip_planner_item_id 
    AND tp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own discussions"
ON public.trip_planner_discussions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
ON public.trip_planner_discussions FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_trip_planners_updated_at
BEFORE UPDATE ON public.trip_planners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_planner_items_updated_at
BEFORE UPDATE ON public.trip_planner_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_planner_discussions_updated_at
BEFORE UPDATE ON public.trip_planner_discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();