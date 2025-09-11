-- Add RLS policies for catalogue_discussions table
CREATE POLICY "Users can view discussions for catalogue items they can access"
ON public.catalogue_discussions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM catalogue_items ci
    WHERE ci.id = catalogue_discussions.catalogue_item_id
    AND (
      ci.user_id = auth.uid()
      OR ci.catalogue_id IN (
        SELECT catalogue_id FROM catalogue_members
        WHERE user_id = auth.uid() AND status = 'accepted'
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
    SELECT 1 FROM catalogue_items ci
    WHERE ci.id = catalogue_discussions.catalogue_item_id
    AND (
      ci.user_id = auth.uid()
      OR ci.catalogue_id IN (
        SELECT catalogue_id FROM catalogue_members
        WHERE user_id = auth.uid() AND status = 'accepted'
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