-- Create table for catalogue members/invitations
CREATE TABLE public.catalogue_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_id UUID NOT NULL REFERENCES public.catalogues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  invited_by_user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(catalogue_id, user_id)
);

-- Enable RLS
ALTER TABLE public.catalogue_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for catalogue_members
CREATE POLICY "Catalogue owners can invite members" 
ON public.catalogue_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.catalogues 
    WHERE id = catalogue_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own invitations" 
ON public.catalogue_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  invited_by_user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.catalogues 
    WHERE id = catalogue_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own invitations" 
ON public.catalogue_members 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Catalogue owners can manage members" 
ON public.catalogue_members 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.catalogues 
    WHERE id = catalogue_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Catalogue owners can remove members" 
ON public.catalogue_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.catalogues 
    WHERE id = catalogue_id AND user_id = auth.uid()
  ) OR user_id = auth.uid()
);

-- Update catalogues policies to allow shared access
CREATE POLICY "Members can view shared catalogues" 
ON public.catalogues 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.catalogue_members 
    WHERE catalogue_id = id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
  )
);

-- Update catalogue_items policies to allow shared access
CREATE POLICY "Members can view shared catalogue items" 
ON public.catalogue_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.catalogue_members 
    WHERE catalogue_id = catalogue_items.catalogue_id 
    AND user_id = auth.uid() 
    AND status = 'accepted'
  )
);

CREATE POLICY "Members can add items to shared catalogues" 
ON public.catalogue_items 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (
      SELECT 1 FROM public.catalogues 
      WHERE id = catalogue_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.catalogue_members 
      WHERE catalogue_id = catalogue_items.catalogue_id 
      AND user_id = auth.uid() 
      AND status = 'accepted'
    )
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_catalogue_members_updated_at
BEFORE UPDATE ON public.catalogue_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification for catalogue invitations
CREATE OR REPLACE FUNCTION public.notify_catalogue_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      'catalogue_invitation',
      'Catalogue Invitation',
      'You were invited to join the "' || c.name || '" catalogue',
      NEW.invited_by_user_id
    FROM catalogues c
    WHERE c.id = NEW.catalogue_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for catalogue invitation notifications
CREATE TRIGGER trigger_notify_catalogue_invitation
AFTER INSERT ON public.catalogue_members
FOR EACH ROW
EXECUTE FUNCTION public.notify_catalogue_invitation();