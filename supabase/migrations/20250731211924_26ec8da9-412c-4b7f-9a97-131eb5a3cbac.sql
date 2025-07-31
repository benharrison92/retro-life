-- Add foreign key constraints for data integrity
ALTER TABLE retro_attendees 
ADD CONSTRAINT fk_retro_attendees_retro_id 
FOREIGN KEY (retro_id) REFERENCES retrospectives(id) ON DELETE CASCADE;

ALTER TABLE retro_attendees 
ADD CONSTRAINT fk_retro_attendees_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate attendees
ALTER TABLE retro_attendees 
ADD CONSTRAINT unique_retro_user 
UNIQUE (retro_id, user_id);