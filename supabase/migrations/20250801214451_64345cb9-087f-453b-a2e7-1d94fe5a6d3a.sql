-- Update the notifications type check constraint to include catalogue_invitation
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['retro_tagged'::text, 'comment_added'::text, 'friend_request'::text, 'catalogue_invitation'::text]));