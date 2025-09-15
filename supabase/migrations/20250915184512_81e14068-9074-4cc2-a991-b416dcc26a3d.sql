-- Fix critical security vulnerability: restrict user profile access to authenticated users only
-- Remove the overly permissive policy that allows anyone to view all user profiles
DROP POLICY IF EXISTS "Users can search profiles for friend discovery" ON user_profiles;

-- Create a new policy that requires authentication for profile searches
CREATE POLICY "Authenticated users can search profiles for friend discovery" 
ON user_profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- The existing "Users can view their own profile" policy remains unchanged
-- This ensures users can still see their own profile and search for friends, but only when authenticated