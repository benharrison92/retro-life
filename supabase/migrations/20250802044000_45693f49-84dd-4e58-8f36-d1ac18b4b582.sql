-- Create storage bucket for retro photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('retro-photos', 'retro-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for retro photos
-- Allow anyone to view photos
CREATE POLICY "Anyone can view retro photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'retro-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload retro photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'retro-photos' AND auth.uid() IS NOT NULL);

-- Allow users to update/delete their own photos
CREATE POLICY "Users can update their own retro photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'retro-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own retro photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'retro-photos' AND auth.uid()::text = (storage.foldername(name))[1]);