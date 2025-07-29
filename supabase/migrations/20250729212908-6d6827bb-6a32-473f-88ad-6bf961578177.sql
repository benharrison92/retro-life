-- Fix the Profiles table RLS policy issue
-- First, let's check what's in the Profiles table and fix any issues
DROP TABLE IF EXISTS public.Profiles;

-- The user_profiles table already exists and has proper policies, so we don't need the Profiles table