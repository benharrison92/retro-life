-- Allow users to search for other users to send friend requests
-- This policy allows viewing basic profile info (name, email) for friend discovery
CREATE POLICY "Users can search profiles for friend discovery" 
ON public.user_profiles 
FOR SELECT 
USING (true);

-- Update the existing restrictive policies to be more specific
-- First drop the overly restrictive policies
DROP POLICY IF EXISTS "Users can view friends profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own and friends profiles only" ON public.user_profiles;