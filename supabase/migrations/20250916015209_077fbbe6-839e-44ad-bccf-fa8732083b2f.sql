-- Create trip_planner_members table
CREATE TABLE public.trip_planner_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_planner_id UUID NOT NULL REFERENCES public.trip_planners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  invited_by_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_planner_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_planner_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_planner_members
CREATE POLICY "Trip planner owners can invite members" ON public.trip_planner_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_members.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip planner owners can manage members" ON public.trip_planner_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_members.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip planner owners can remove members" ON public.trip_planner_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_members.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their own invitations" ON public.trip_planner_members
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view relevant trip planner members" ON public.trip_planner_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    invited_by_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_members.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    )
  );

-- Update trip_planners RLS to allow members access
CREATE POLICY "Members can view shared trip planners" ON public.trip_planners
  FOR SELECT USING (
    id IN (
      SELECT trip_planner_id FROM public.trip_planner_members
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );

-- Update trip_planner_items RLS to allow members access
CREATE POLICY "Members can create items for shared trip planners" ON public.trip_planner_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM public.trip_planners
        WHERE trip_planners.id = trip_planner_items.trip_planner_id
        AND trip_planners.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.trip_planner_members
        WHERE trip_planner_members.trip_planner_id = trip_planner_items.trip_planner_id
        AND trip_planner_members.user_id = auth.uid()
        AND trip_planner_members.status = 'accepted'
      )
    )
  );

CREATE POLICY "Members can view items for shared trip planners" ON public.trip_planner_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_items.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.trip_planner_members
      WHERE trip_planner_members.trip_planner_id = trip_planner_items.trip_planner_id
      AND trip_planner_members.user_id = auth.uid()
      AND trip_planner_members.status = 'accepted'
    )
  );

CREATE POLICY "Members can update items for shared trip planners" ON public.trip_planner_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_items.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.trip_planner_members
      WHERE trip_planner_members.trip_planner_id = trip_planner_items.trip_planner_id
      AND trip_planner_members.user_id = auth.uid()
      AND trip_planner_members.status = 'accepted'
    )
  );

CREATE POLICY "Members can delete items for shared trip planners" ON public.trip_planner_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trip_planners
      WHERE trip_planners.id = trip_planner_items.trip_planner_id
      AND trip_planners.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.trip_planner_members
      WHERE trip_planner_members.trip_planner_id = trip_planner_items.trip_planner_id
      AND trip_planner_members.user_id = auth.uid()
      AND trip_planner_members.status = 'accepted'
    )
  );

-- Update trip_planner_discussions RLS to allow members access
CREATE POLICY "Members can create discussions for shared trip planner items" ON public.trip_planner_discussions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (
        SELECT 1 FROM trip_planner_items tpi
        JOIN trip_planners tp ON tpi.trip_planner_id = tp.id
        WHERE tpi.id = trip_planner_discussions.trip_planner_item_id
        AND tp.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM trip_planner_items tpi
        JOIN trip_planner_members tpm ON tpi.trip_planner_id = tpm.trip_planner_id
        WHERE tpi.id = trip_planner_discussions.trip_planner_item_id
        AND tpm.user_id = auth.uid()
        AND tpm.status = 'accepted'
      )
    )
  );

CREATE POLICY "Members can view discussions for shared trip planner items" ON public.trip_planner_discussions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_planner_items tpi
      JOIN trip_planners tp ON tpi.trip_planner_id = tp.id
      WHERE tpi.id = trip_planner_discussions.trip_planner_item_id
      AND tp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM trip_planner_items tpi
      JOIN trip_planner_members tpm ON tpi.trip_planner_id = tpm.trip_planner_id
      WHERE tpi.id = trip_planner_discussions.trip_planner_item_id
      AND tpm.user_id = auth.uid()
      AND tpm.status = 'accepted'
    )
  );

-- Create trigger for trip_planner_members notifications
CREATE OR REPLACE FUNCTION public.notify_trip_planner_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for new invitations
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_user_id
    )
    SELECT 
      NEW.user_id,
      'trip_planner_invitation',
      'You were invited to join the "' || tp.title || '" trip planner',
      'Click to accept or decline this invitation',
      NEW.invited_by_user_id
    FROM public.trip_planners tp
    WHERE tp.id = NEW.trip_planner_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER trip_planner_invitation_trigger
  AFTER INSERT ON public.trip_planner_members
  FOR EACH ROW EXECUTE FUNCTION public.notify_trip_planner_invitation();

-- Add updated_at trigger
CREATE TRIGGER update_trip_planner_members_updated_at 
  BEFORE UPDATE ON public.trip_planner_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_trip_planner_members_trip_planner_id ON public.trip_planner_members(trip_planner_id);
CREATE INDEX idx_trip_planner_members_user_id ON public.trip_planner_members(user_id);
CREATE INDEX idx_trip_planner_members_status ON public.trip_planner_members(status);