BEGIN;

-- Functions to avoid circular references in RLS policies
CREATE OR REPLACE FUNCTION public.is_trip_planner_owner(trip_planner_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.trip_planners tp
    WHERE tp.id = trip_planner_uuid AND tp.user_id = user_uuid
  ) INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_trip_planner_member(trip_planner_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result boolean := false;
BEGIN
  -- Owner is implicitly a member
  IF public.is_trip_planner_owner(trip_planner_uuid, user_uuid) THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.trip_planner_members tpm
    WHERE tpm.trip_planner_id = trip_planner_uuid
      AND tpm.user_id = user_uuid
      AND tpm.status = 'accepted'
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.is_trip_planner_owner(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_trip_planner_member(uuid, uuid) TO anon, authenticated;

-- Update trip_planners policy to use function (breaks circular ref)
DROP POLICY IF EXISTS "Members can view shared trip planners" ON public.trip_planners;
CREATE POLICY "Members can view shared trip planners"
ON public.trip_planners
FOR SELECT
USING (public.is_trip_planner_member(id, auth.uid()));

-- Update trip_planner_members policies to avoid direct references to trip_planners
DROP POLICY IF EXISTS "Trip planner owners can invite members" ON public.trip_planner_members;
CREATE POLICY "Trip planner owners can invite members"
ON public.trip_planner_members
FOR INSERT
WITH CHECK (public.is_trip_planner_owner(trip_planner_id, auth.uid()));

DROP POLICY IF EXISTS "Trip planner owners can manage members" ON public.trip_planner_members;
CREATE POLICY "Trip planner owners can manage members"
ON public.trip_planner_members
FOR UPDATE
USING (public.is_trip_planner_owner(trip_planner_id, auth.uid()));

DROP POLICY IF EXISTS "Trip planner owners can remove members" ON public.trip_planner_members;
CREATE POLICY "Trip planner owners can remove members"
ON public.trip_planner_members
FOR DELETE
USING (public.is_trip_planner_owner(trip_planner_id, auth.uid()) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view relevant trip planner members" ON public.trip_planner_members;
CREATE POLICY "Users can view relevant trip planner members"
ON public.trip_planner_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR invited_by_user_id = auth.uid()
  OR public.is_trip_planner_owner(trip_planner_id, auth.uid())
);

COMMIT;