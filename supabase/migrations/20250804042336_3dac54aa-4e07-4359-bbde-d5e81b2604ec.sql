-- Check current policies on retro_attendees table
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'retro_attendees';

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Users can manage retro attendees" ON retro_attendees;
DROP POLICY IF EXISTS "Users can view retro attendees" ON retro_attendees;
DROP POLICY IF EXISTS "Users can insert retro attendees" ON retro_attendees;
DROP POLICY IF EXISTS "Users can update retro attendees" ON retro_attendees;
DROP POLICY IF EXISTS "Users can delete retro attendees" ON retro_attendees;
DROP POLICY IF EXISTS "Retro owners can manage attendees" ON retro_attendees;

-- Create simple, non-recursive policies for retro_attendees
-- Allow users to view attendees if they can view the retro
CREATE POLICY "retro_attendees_select_policy" ON retro_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM retrospectives r 
    WHERE r.id = retro_attendees.retro_id 
    AND (r.user_id = auth.uid() OR NOT r.is_private)
  )
);

-- Allow retro owners to insert attendees
CREATE POLICY "retro_attendees_insert_policy" ON retro_attendees
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM retrospectives r 
    WHERE r.id = retro_attendees.retro_id 
    AND r.user_id = auth.uid()
  )
);

-- Allow retro owners to delete attendees
CREATE POLICY "retro_attendees_delete_policy" ON retro_attendees
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM retrospectives r 
    WHERE r.id = retro_attendees.retro_id 
    AND r.user_id = auth.uid()
  )
);