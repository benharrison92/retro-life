-- Create a secure function for user search that only exposes safe data
CREATE OR REPLACE FUNCTION public.search_users_for_friend_discovery(search_query text)
RETURNS TABLE(
  id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return display_name and avatar_url for security
  -- Do not expose email addresses to prevent harvesting
  RETURN QUERY
  SELECT 
    up.id,
    up.display_name,
    up.avatar_url
  FROM user_profiles up
  WHERE 
    up.display_name ILIKE '%' || search_query || '%'
    AND up.id != auth.uid() -- Exclude current user
  ORDER BY up.display_name
  LIMIT 10;
END;
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can search profiles for friend discovery" ON user_profiles;

-- Create a more restrictive policy that only allows users to see their own profile and friends' profiles
CREATE POLICY "Users can view their own profile and friends profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE ((f.user_id = auth.uid() AND f.friend_id = user_profiles.id) 
             OR (f.friend_id = auth.uid() AND f.user_id = user_profiles.id))
      AND f.status = 'accepted'
    )
  );

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.search_users_for_friend_discovery TO authenticated;