-- Add foreign key constraints to catalogue_members table
ALTER TABLE catalogue_members 
ADD CONSTRAINT catalogue_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE catalogue_members 
ADD CONSTRAINT catalogue_members_invited_by_user_id_fkey 
FOREIGN KEY (invited_by_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint to catalogues table for user_id
ALTER TABLE catalogues 
ADD CONSTRAINT catalogues_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;