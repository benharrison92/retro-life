-- Add RLS policy for the Profiles table (which seems to be a duplicate/unused table)
-- First check if it has any important data, if not we can just add a basic policy
CREATE POLICY "Users can view profiles" ON "Profiles" FOR SELECT USING (true);

-- The Profiles table appears to be unused based on the schema, but we'll add a policy for completeness