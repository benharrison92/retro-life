-- Add foreign key relationship between retrospective_comments and user_profiles
-- Note: retrospective_comments.user_id references auth.users, but we need to join with user_profiles
-- Since user_profiles.id also references auth.users.id, we can use that relationship

-- Update the retrospective_comments table to reference user_profiles directly
-- First drop the old foreign key constraint
ALTER TABLE public.retrospective_comments DROP CONSTRAINT retrospective_comments_user_id_fkey;

-- Add new foreign key constraint to user_profiles
ALTER TABLE public.retrospective_comments 
ADD CONSTRAINT retrospective_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;