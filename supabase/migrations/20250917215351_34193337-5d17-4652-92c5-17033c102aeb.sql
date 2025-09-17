-- Create 7 fake user profiles
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'emma.watson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Emma Watson"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'marco.rossi@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Marco Rossi"}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'sophie.bernard@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Sophie Bernard"}', 'authenticated', 'authenticated'),
  ('44444444-4444-4444-4444-444444444444', 'james.miller@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "James Miller"}', 'authenticated', 'authenticated'),
  ('55555555-5555-5555-5555-555555555555', 'lucia.ferrari@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Lucia Ferrari"}', 'authenticated', 'authenticated'),
  ('66666666-6666-6666-6666-666666666666', 'thomas.schmidt@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Thomas Schmidt"}', 'authenticated', 'authenticated'),
  ('77777777-7777-7777-7777-777777777777', 'olivia.dubois@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Olivia Dubois"}', 'authenticated', 'authenticated');

-- Create corresponding user profiles
INSERT INTO user_profiles (
  id,
  email,
  display_name,
  avatar_url,
  bio,
  created_at,
  updated_at
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'emma.watson@example.com', 'Emma Watson', 'https://images.unsplash.com/photo-1494790108755-2616b9c9b4b5', 'Art lover and travel enthusiast from London', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'marco.rossi@example.com', 'Marco Rossi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'Italian food blogger exploring Europe', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'sophie.bernard@example.com', 'Sophie Bernard', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'French photographer capturing life moments', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'james.miller@example.com', 'James Miller', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Adventure seeker from California', now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'lucia.ferrari@example.com', 'Lucia Ferrari', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 'Architecture student from Milan', now(), now()),
  ('66666666-6666-6666-6666-666666666666', 'thomas.schmidt@example.com', 'Thomas Schmidt', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'Tech nomad from Berlin', now(), now()),
  ('77777777-7777-7777-7777-777777777777', 'olivia.dubois@example.com', 'Olivia Dubois', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'Wine enthusiast from Paris', now(), now());

-- Create retrospectives for Florence
INSERT INTO retrospectives (
  id,
  user_id,
  title,
  date,
  event_type,
  location_name,
  city,
  state,
  country,
  latitude,
  longitude,
  is_private,
  roses,
  buds,
  thorns,
  created_at,
  updated_at
) VALUES 
  -- Emma's Florence trip
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Renaissance Dreams in Florence', '2024-08-15', 'vacation', 'Florence Historic Center', 'Florence', 'Tuscany', 'Italy', 43.7696, 11.2558, false,
   '[
     {"id": "r1", "text": "The Uffizi Gallery was absolutely breathtaking! Seeing Botticelli''s Birth of Venus in person gave me chills.", "ownerName": "Emma Watson", "photos": [], "tags": ["art", "culture"], "comments": []},
     {"id": "r2", "text": "Sunset views from Piazzale Michelangelo were magical - the whole city turned golden!", "ownerName": "Emma Watson", "photos": [], "tags": ["sunset", "views"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to learn more about Renaissance art history after this trip", "ownerName": "Emma Watson", "photos": [], "tags": ["learning", "art"], "comments": []},
     {"id": "b2", "text": "Planning to take an Italian cooking class next time I visit", "ownerName": "Emma Watson", "photos": [], "tags": ["cooking", "italy"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "The crowds at the Duomo were overwhelming - barely got any good photos", "ownerName": "Emma Watson", "photos": [], "tags": ["crowds", "tourism"], "comments": []},
     {"id": "t2", "text": "Got lost multiple times in the narrow medieval streets without GPS", "ownerName": "Emma Watson", "photos": [], "tags": ["navigation", "streets"], "comments": []}
   ]',
   now(), now()),

  -- Marco's Florence trip
  ('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Tuscan Flavors Adventure', '2024-07-20', 'food_tour', 'Oltrarno District', 'Florence', 'Tuscany', 'Italy', 43.7648, 11.2462, false,
   '[
     {"id": "r1", "text": "The bistecca alla fiorentina at Trattoria Mario was perfection!", "ownerName": "Marco Rossi", "photos": [], "tags": ["food", "steak"], "comments": []},
     {"id": "r2", "text": "Local wine tasting in Chianti countryside exceeded all expectations", "ownerName": "Marco Rossi", "photos": [], "tags": ["wine", "chianti"], "comments": []},
     {"id": "r3", "text": "Fresh truffle pasta at Mercato Centrale made my day!", "ownerName": "Marco Rossi", "photos": [], "tags": ["pasta", "truffles"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to return during truffle season for more authentic experiences", "ownerName": "Marco Rossi", "photos": [], "tags": ["truffles", "seasonal"], "comments": []},
     {"id": "b2", "text": "Planning to visit smaller Tuscan villages next time", "ownerName": "Marco Rossi", "photos": [], "tags": ["tuscany", "villages"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Tourist trap restaurants near major attractions had terrible food", "ownerName": "Marco Rossi", "photos": [], "tags": ["tourist traps", "food"], "comments": []},
     {"id": "t2", "text": "Language barrier made ordering at authentic places challenging", "ownerName": "Marco Rossi", "photos": [], "tags": ["language", "communication"], "comments": []}
   ]',
   now(), now()),

  -- Sophie's Florence trip
  ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Capturing Florence Through My Lens', '2024-09-05', 'photography', 'Ponte Vecchio', 'Florence', 'Tuscany', 'Italy', 43.7678, 11.2530, false,
   '[
     {"id": "r1", "text": "Golden hour photography at Ponte Vecchio created stunning reflections", "ownerName": "Sophie Bernard", "photos": [], "tags": ["photography", "golden hour"], "comments": []},
     {"id": "r2", "text": "The architectural details of Santa Croce basilica are photographer''s paradise", "ownerName": "Sophie Bernard", "photos": [], "tags": ["architecture", "details"], "comments": []},
     {"id": "r3", "text": "Street performers in Piazza della Signoria added life to my shots", "ownerName": "Sophie Bernard", "photos": [], "tags": ["street photography", "performers"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore more hidden courtyards for intimate photography", "ownerName": "Sophie Bernard", "photos": [], "tags": ["hidden gems", "courtyards"], "comments": []},
     {"id": "b2", "text": "Planning a photography workshop in Tuscany countryside", "ownerName": "Sophie Bernard", "photos": [], "tags": ["workshop", "countryside"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Constant construction work ruined several planned shots", "ownerName": "Sophie Bernard", "photos": [], "tags": ["construction", "obstacles"], "comments": []},
     {"id": "t2", "text": "Heavy camera gear became exhausting while walking on cobblestones", "ownerName": "Sophie Bernard", "photos": [], "tags": ["equipment", "walking"], "comments": []}
   ]',
   now(), now());

-- Create retrospectives for Lucerne
INSERT INTO retrospectives (
  id,
  user_id,
  title,
  date,
  event_type,
  location_name,
  city,
  state,
  country,
  latitude,
  longitude,
  is_private,
  roses,
  buds,
  thorns,
  created_at,
  updated_at
) VALUES 
  -- James's Lucerne trip
  ('l4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Alpine Adventure in Lucerne', '2024-08-10', 'adventure', 'Mount Pilatus', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9481, 8.3369, false,
   '[
     {"id": "r1", "text": "The cogwheel train ride to Mount Pilatus was absolutely thrilling!", "ownerName": "James Miller", "photos": [], "tags": ["adventure", "mountains"], "comments": []},
     {"id": "r2", "text": "Lake Lucerne''s crystal clear waters perfect for an early morning swim", "ownerName": "James Miller", "photos": [], "tags": ["swimming", "lake"], "comments": []},
     {"id": "r3", "text": "Paragliding over the Swiss Alps gave me the ultimate adrenaline rush!", "ownerName": "James Miller", "photos": [], "tags": ["paragliding", "alps"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to tackle more challenging hiking trails in the region", "ownerName": "James Miller", "photos": [], "tags": ["hiking", "challenge"], "comments": []},
     {"id": "b2", "text": "Planning to try winter sports here during ski season", "ownerName": "James Miller", "photos": [], "tags": ["winter sports", "skiing"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Weather turned suddenly and ruined one full day of outdoor activities", "ownerName": "James Miller", "photos": [], "tags": ["weather", "rain"], "comments": []},
     {"id": "t2", "text": "Tourist prices for everything were shockingly expensive", "ownerName": "James Miller", "photos": [], "tags": ["expensive", "budget"], "comments": []}
   ]',
   now(), now()),

  -- Lucia's Lucerne trip
  ('l5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Swiss Architecture Study Tour', '2024-07-25', 'education', 'Chapel Bridge', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9529, 8.3089, false,
   '[
     {"id": "r1", "text": "Chapel Bridge''s medieval architecture is a masterpiece of engineering", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["architecture", "medieval"], "comments": []},
     {"id": "r2", "text": "The contrast between old town and modern Lucerne is fascinating", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["contrast", "modern"], "comments": []},
     {"id": "r3", "text": "Culture and Convention Centre''s design by Jean Nouvel is inspiring", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["modern architecture", "design"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to study more examples of Swiss sustainable architecture", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["sustainability", "green building"], "comments": []},
     {"id": "b2", "text": "Planning to interview local architects about Alpine building techniques", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["interviews", "techniques"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Limited access to some historical buildings for detailed study", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["access", "restrictions"], "comments": []},
     {"id": "t2", "text": "Language barrier made it hard to get detailed information from locals", "ownerName": "Lucia Ferrari", "photos": [], "tags": ["language", "information"], "comments": []}
   ]',
   now(), now()),

  -- Thomas's Lucerne trip
  ('l6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Digital Nomad Base: Lucerne', '2024-08-30', 'business', 'Lucerne Old Town', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9481, 8.3089, false,
   '[
     {"id": "r1", "text": "Excellent WiFi and coworking spaces made remote work seamless", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["wifi", "coworking"], "comments": []},
     {"id": "r2", "text": "The calm lake environment boosted my productivity significantly", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["productivity", "environment"], "comments": []},
     {"id": "r3", "text": "Swiss efficiency in everything from transport to digital services", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["efficiency", "transport"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore more coworking spaces in other Swiss cities", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["coworking", "swiss cities"], "comments": []},
     {"id": "b2", "text": "Planning to attend tech meetups and networking events here", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["networking", "tech"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Extremely high cost of living made long-term stay challenging", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["cost of living", "budget"], "comments": []},
     {"id": "t2", "text": "Limited nightlife and social scene for young professionals", "ownerName": "Thomas Schmidt", "photos": [], "tags": ["nightlife", "social"], "comments": []}
   ]',
   now(), now()),

  -- Olivia's Lucerne trip
  ('l7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'Swiss Wine & Culture Experience', '2024-09-12', 'cultural', 'Lake Lucerne', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9529, 8.3089, false,
   '[
     {"id": "r1", "text": "Discovered amazing Swiss wines at local vineyards around the lake", "ownerName": "Olivia Dubois", "photos": [], "tags": ["wine", "vineyards"], "comments": []},
     {"id": "r2", "text": "Traditional Swiss folk music concert at KKL was absolutely charming", "ownerName": "Olivia Dubois", "photos": [], "tags": ["music", "culture"], "comments": []},
     {"id": "r3", "text": "Boat cruise on Lake Lucerne with wine tasting was perfect", "ownerName": "Olivia Dubois", "photos": [], "tags": ["boat cruise", "wine tasting"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore more Swiss wine regions and their unique varieties", "ownerName": "Olivia Dubois", "photos": [], "tags": ["wine regions", "varieties"], "comments": []},
     {"id": "b2", "text": "Planning to learn about Swiss winemaking techniques", "ownerName": "Olivia Dubois", "photos": [], "tags": ["winemaking", "techniques"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Limited selection of local wines compared to French regions", "ownerName": "Olivia Dubois", "photos": [], "tags": ["selection", "comparison"], "comments": []},
     {"id": "t2", "text": "Some cultural events had very limited English translations", "ownerName": "Olivia Dubois", "photos": [], "tags": ["language", "translations"], "comments": []}
   ]',
   now(), now());

-- Create some activities for the feed
INSERT INTO activities (
  user_id,
  activity_type,
  target_id,
  target_type,
  data
) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'rose_added', 'f1111111-1111-1111-1111-111111111111', 'retrospective', '{"title": "Renaissance Dreams in Florence", "count": 2}'),
  ('22222222-2222-2222-2222-222222222222', 'bud_added', 'f2222222-2222-2222-2222-222222222222', 'retrospective', '{"title": "Tuscan Flavors Adventure", "count": 2}'),
  ('33333333-3333-3333-3333-333333333333', 'thorn_added', 'f3333333-3333-3333-3333-333333333333', 'retrospective', '{"title": "Capturing Florence Through My Lens", "count": 2}'),
  ('44444444-4444-4444-4444-444444444444', 'rose_added', 'l4444444-4444-4444-4444-444444444444', 'retrospective', '{"title": "Alpine Adventure in Lucerne", "count": 3}'),
  ('55555555-5555-5555-5555-555555555555', 'bud_added', 'l5555555-5555-5555-5555-555555555555', 'retrospective', '{"title": "Swiss Architecture Study Tour", "count": 2}'),
  ('66666666-6666-6666-6666-666666666666', 'thorn_added', 'l6666666-6666-6666-6666-666666666666', 'retrospective', '{"title": "Digital Nomad Base: Lucerne", "count": 2}'),
  ('77777777-7777-7777-7777-777777777777', 'rose_added', 'l7777777-7777-7777-7777-777777777777', 'retrospective', '{"title": "Swiss Wine & Culture Experience", "count": 3}');

-- Create some friendships between users for better feed interaction
INSERT INTO friendships (user_id, friend_id, status) VALUES 
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'accepted'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'accepted'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'accepted'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'accepted'),
  ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'accepted'),
  ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'accepted'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'accepted');