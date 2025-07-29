-- Create storage policies for retro-photos bucket
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'retro-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'retro-photos');

CREATE POLICY "Users can update their own photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'retro-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'retro-photos' AND auth.uid() IS NOT NULL);