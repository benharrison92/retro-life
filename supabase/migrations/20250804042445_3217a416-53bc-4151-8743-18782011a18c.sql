-- Drop ALL existing policies on retro_attendees table
DROP POLICY IF EXISTS "Attendees can add other attendees to retros they're part of" ON retro_attendees;
DROP POLICY IF EXISTS "Users can remove attendees from their own retros" ON retro_attendees;
DROP POLICY IF EXISTS "Users can view attendees of their own retros or retros they're part of" ON retro_attendees;
DROP POLICY IF EXISTS "retro_attendees_select_policy" ON retro_attendees;
DROP POLICY IF EXISTS "retro_attendees_insert_policy" ON retro_attendees;
DROP POLICY IF EXISTS "retro_attendees_delete_policy" ON retro_attendees;

-- Create clean, simple policies without any recursive functions
CREATE POLICY "retro_attendees_select" ON retro_attendees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND (retrospectives.user_id = auth.uid() OR NOT retrospectives.is_private)
  )
);

CREATE POLICY "retro_attendees_insert" ON retro_attendees
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND retrospectives.user_id = auth.uid()
  )
);

CREATE POLICY "retro_attendees_delete" ON retro_attendees
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM retrospectives 
    WHERE retrospectives.id = retro_attendees.retro_id 
    AND retrospectives.user_id = auth.uid()
  )
);