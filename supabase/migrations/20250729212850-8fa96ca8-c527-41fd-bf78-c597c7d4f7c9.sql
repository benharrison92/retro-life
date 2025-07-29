-- Create storage bucket for retro photos
INSERT INTO storage.buckets (id, name, public) VALUES ('retro-photos', 'retro-photos', true);

-- Add photos field to retrospectives table
ALTER TABLE retrospectives 
ADD COLUMN photos jsonb DEFAULT '[]'::jsonb;

-- Create storage policies for retro photos
CREATE POLICY "Users can upload their own retro photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'retro-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view retro photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'retro-photos');

CREATE POLICY "Users can update their own retro photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'retro-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own retro photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'retro-photos' AND auth.uid()::text = (storage.foldername(name))[1]);