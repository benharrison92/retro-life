-- Update notifications type check constraint to include trip_planner_invitation
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'retro_tagged',
  'friend_request', 
  'catalogue_invitation',
  'trip_planner_invitation'
));