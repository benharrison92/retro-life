-- Fix the foreign key relationship for catalogue_discussions
ALTER TABLE public.catalogue_discussions 
ADD CONSTRAINT catalogue_discussions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_catalogue_discussions_user_id 
ON public.catalogue_discussions(user_id);

-- Create an index for catalogue_item_id for better performance
CREATE INDEX IF NOT EXISTS idx_catalogue_discussions_catalogue_item_id 
ON public.catalogue_discussions(catalogue_item_id);