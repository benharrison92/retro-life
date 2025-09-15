-- Create some sample activities for testing the feed
-- Get some recent retrospectives and create activities for them
INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data)
SELECT 
  user_id,
  'retro_created',
  id,
  'retrospective',
  jsonb_build_object('title', title, 'event_type', event_type)
FROM retrospectives 
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 5;

-- Create some rose/bud/thorn activities for retros with content
INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data)
SELECT 
  user_id,
  'rose_added',
  id,
  'retrospective',
  jsonb_build_object('title', title, 'count', jsonb_array_length(COALESCE(roses, '[]'::jsonb)))
FROM retrospectives 
WHERE jsonb_array_length(COALESCE(roses, '[]'::jsonb)) > 0
ORDER BY created_at DESC
LIMIT 3;

INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data)
SELECT 
  user_id,
  'bud_added',
  id,
  'retrospective',
  jsonb_build_object('title', title, 'count', jsonb_array_length(COALESCE(buds, '[]'::jsonb)))
FROM retrospectives 
WHERE jsonb_array_length(COALESCE(buds, '[]'::jsonb)) > 0
ORDER BY created_at DESC
LIMIT 3;