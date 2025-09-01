-- Fix user_profiles security vulnerability
-- Remove the overly permissive policy that allows all users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Create a security definer function to check friendship status
CREATE OR REPLACE FUNCTION public.are_users_friends(_user1 uuid, _user2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.friendships 
    WHERE ((user_id = _user1 AND friend_id = _user2) OR (user_id = _user2 AND friend_id = _user1))
    AND status = 'accepted'
  );
$$;

-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can view friends' profiles (including email for friends)
CREATE POLICY "Users can view friends profiles"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND public.are_users_friends(auth.uid(), id)
);

-- Policy 3: Limited public profile info for discovery (display_name and avatar only, no email/bio)
-- This allows for user discovery and tagging features without exposing sensitive data
CREATE POLICY "Limited public profile for discovery"
ON public.user_profiles
FOR SELECT
USING (true);

-- However, we need to implement field-level security for the public policy
-- Since PostgreSQL RLS doesn't support column-level policies natively,
-- we'll create a view for public profile data and restrict the main table

-- Create a public view that only exposes safe profile information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.user_profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Update the main table policy to be more restrictive
-- Remove the broad public policy and replace with friend-only access
DROP POLICY IF EXISTS "Limited public profile for discovery" ON public.user_profiles;

-- Final policies: own profile + friends only
-- Users can only see full profiles (including email) of themselves and accepted friends
CREATE POLICY "Users can view own and friends profiles only"
ON public.user_profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND public.are_users_friends(auth.uid(), id))
);