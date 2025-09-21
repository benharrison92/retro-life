-- Update the search function to be more permissive and show more users
CREATE OR REPLACE FUNCTION public.search_users_for_friend_discovery(search_query text DEFAULT '')
RETURNS TABLE(id uuid, display_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If no search query, return recent users (excluding current user)
  IF search_query = '' OR search_query IS NULL THEN
    RETURN QUERY
    SELECT 
      up.id,
      up.display_name,
      up.avatar_url
    FROM user_profiles up
    WHERE 
      up.id != auth.uid() -- Exclude current user
      AND up.display_name IS NOT NULL 
      AND up.display_name != ''
    ORDER BY up.created_at DESC
    LIMIT 50; -- Show up to 50 recent users
  ELSE
    -- Search by display name (case insensitive, partial match)
    RETURN QUERY
    SELECT 
      up.id,
      up.display_name,
      up.avatar_url
    FROM user_profiles up
    WHERE 
      up.display_name ILIKE '%' || search_query || '%'
      AND up.id != auth.uid() -- Exclude current user
      AND up.display_name IS NOT NULL 
      AND up.display_name != ''
    ORDER BY 
      -- Prioritize exact matches, then starts with, then contains
      CASE 
        WHEN LOWER(up.display_name) = LOWER(search_query) THEN 1
        WHEN LOWER(up.display_name) LIKE LOWER(search_query) || '%' THEN 2
        ELSE 3
      END,
      up.display_name
    LIMIT 50;
  END IF;
END;
$$;