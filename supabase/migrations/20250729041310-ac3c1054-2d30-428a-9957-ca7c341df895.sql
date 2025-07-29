-- Create retrospectives table for storing retro data with location tracking
CREATE TABLE public.retrospectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  date DATE NOT NULL,
  attendees TEXT[] DEFAULT '{}',
  roses JSONB DEFAULT '[]',
  buds JSONB DEFAULT '[]',
  thorns JSONB DEFAULT '[]',
  -- Location fields
  location_name TEXT, -- e.g., "Anaheim, CA"
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.retrospectives ENABLE ROW LEVEL SECURITY;

-- Create policies for retrospectives access
CREATE POLICY "Users can view their own retrospectives" 
ON public.retrospectives 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retrospectives" 
ON public.retrospectives 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives" 
ON public.retrospectives 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives" 
ON public.retrospectives 
FOR DELETE 
USING (auth.uid() = user_id);

-- Friends can view each other's retrospectives
CREATE POLICY "Friends can view retrospectives" 
ON public.retrospectives 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM friendships 
    WHERE (
      (user_id = auth.uid() AND friend_id = retrospectives.user_id) OR
      (friend_id = auth.uid() AND user_id = retrospectives.user_id)
    ) AND status = 'accepted'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_retrospectives_updated_at
BEFORE UPDATE ON public.retrospectives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_retrospectives_user_id ON retrospectives(user_id);
CREATE INDEX idx_retrospectives_location ON retrospectives(city, state);
CREATE INDEX idx_retrospectives_coordinates ON retrospectives(latitude, longitude);
CREATE INDEX idx_retrospectives_date ON retrospectives(date);