-- Fix security warning by properly setting search_path for existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Fix search path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix search path for prevent_retro_cycles function
CREATE OR REPLACE FUNCTION public.prevent_retro_cycles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the new parent is a descendant of this retro
        IF EXISTS (
            WITH RECURSIVE retro_tree AS (
                -- Start with the current retro
                SELECT id, parent_id, 1 as level
                FROM retrospectives 
                WHERE id = NEW.id
                
                UNION ALL
                
                -- Recursively find all descendants
                SELECT r.id, r.parent_id, rt.level + 1
                FROM retrospectives r
                INNER JOIN retro_tree rt ON r.parent_id = rt.id
                WHERE rt.level < 10 -- Prevent infinite loops
            )
            SELECT 1 FROM retro_tree WHERE id = NEW.parent_id
        ) THEN
            RAISE EXCEPTION 'Cannot set parent: would create a cycle in retro hierarchy';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Fix search path for accept_invite_txn function
CREATE OR REPLACE FUNCTION public.accept_invite_txn(p_from_user uuid, p_to_user uuid, p_invite_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Create friendship in canonical order; upsert to ensure only one record
  INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
  VALUES (LEAST(p_from_user, p_to_user), GREATEST(p_from_user, p_to_user), 'accepted', NOW(), NOW())
  ON CONFLICT (user_id, friend_id) DO UPDATE
    SET status = 'accepted', updated_at = NOW();

  -- Mark invite accepted
  UPDATE friend_invitations
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

-- Fix search path for create_activity function
CREATE OR REPLACE FUNCTION public.create_activity(p_user_id uuid, p_activity_type text, p_target_id uuid DEFAULT NULL::uuid, p_target_type text DEFAULT NULL::text, p_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data)
  VALUES (p_user_id, p_activity_type, p_target_id, p_target_type, p_data)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;