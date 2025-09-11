-- Create table for catalogue item discussions
CREATE TABLE public.catalogue_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  catalogue_item_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  tagged_user_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalogue_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for catalogue discussions
CREATE POLICY "Users can view discussions for catalogue items they can access"
ON public.catalogue_discussions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM catalogue_items
    WHERE catalogue_items.id = catalogue_discussions.catalogue_item_id
    AND (
      catalogue_items.user_id = auth.uid()
      OR catalogue_items.catalogue_id IN (
        SELECT catalogue_members.catalogue_id
        FROM catalogue_members
        WHERE catalogue_members.user_id = auth.uid()
        AND catalogue_members.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can create discussions for catalogue items they can access"
ON public.catalogue_discussions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM catalogue_items
    WHERE catalogue_items.id = catalogue_discussions.catalogue_item_id
    AND (
      catalogue_items.user_id = auth.uid()
      OR catalogue_items.catalogue_id IN (
        SELECT catalogue_members.catalogue_id
        FROM catalogue_members
        WHERE catalogue_members.user_id = auth.uid()
        AND catalogue_members.status = 'accepted'
      )
    )
  )
);

CREATE POLICY "Users can update their own discussions"
ON public.catalogue_discussions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
ON public.catalogue_discussions
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_catalogue_discussions_updated_at
BEFORE UPDATE ON public.catalogue_discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();