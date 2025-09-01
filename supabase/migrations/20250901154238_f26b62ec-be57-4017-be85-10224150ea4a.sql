-- Remove the problematic security definer view
DROP VIEW IF EXISTS public.public_profiles;

-- The main security fix is already in place with the restricted RLS policy
-- Users can only see full profiles of themselves and accepted friends
-- This resolves the original security vulnerability

-- For user discovery features in the app, we'll handle this at the application level
-- by creating a separate endpoint or using the existing friends system