-- Create 7 new fake user profiles with different UUIDs
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
  ('a1111111-1111-1111-1111-111111111111', 'emma.travel@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Emma Travel"}', 'authenticated', 'authenticated'),
  ('b2222222-2222-2222-2222-222222222222', 'marco.food@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Marco Food"}', 'authenticated', 'authenticated'),
  ('c3333333-3333-3333-3333-333333333333', 'sophie.photo@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Sophie Photo"}', 'authenticated', 'authenticated'),
  ('d4444444-4444-4444-4444-444444444444', 'james.adventure@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "James Adventure"}', 'authenticated', 'authenticated'),
  ('e5555555-5555-5555-5555-555555555555', 'lucia.arch@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Lucia Arch"}', 'authenticated', 'authenticated'),
  ('f6666666-6666-6666-6666-666666666666', 'thomas.nomad@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Thomas Nomad"}', 'authenticated', 'authenticated'),
  ('g7777777-7777-7777-7777-777777777777', 'olivia.wine@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"display_name": "Olivia Wine"}', 'authenticated', 'authenticated');

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
  ('a1111111-1111-1111-1111-111111111111', 'emma.travel@example.com', 'Emma Travel', 'https://images.unsplash.com/photo-1494790108755-2616b9c9b4b5', 'Art lover exploring Renaissance treasures', now(), now()),
  ('b2222222-2222-2222-2222-222222222222', 'marco.food@example.com', 'Marco Food', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'Culinary explorer discovering Italian flavors', now(), now()),
  ('c3333333-3333-3333-3333-333333333333', 'sophie.photo@example.com', 'Sophie Photo', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'Photographer capturing European beauty', now(), now()),
  ('d4444444-4444-4444-4444-444444444444', 'james.adventure@example.com', 'James Adventure', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Thrill seeker conquering Alpine peaks', now(), now()),
  ('e5555555-5555-5555-5555-555555555555', 'lucia.arch@example.com', 'Lucia Arch', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 'Architecture enthusiast studying Swiss design', now(), now()),
  ('f6666666-6666-6666-6666-666666666666', 'thomas.nomad@example.com', 'Thomas Nomad', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'Digital nomad working from scenic locations', now(), now()),
  ('g7777777-7777-7777-7777-777777777777', 'olivia.wine@example.com', 'Olivia Wine', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'Sommelier exploring European wine regions', now(), now());

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
  ('fa111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Renaissance Magic in Florence', '2024-08-15', 'vacation', 'Florence Historic Center', 'Florence', 'Tuscany', 'Italy', 43.7696, 11.2558, false,
   '[
     {"id": "r1", "text": "The Uffizi Gallery was absolutely breathtaking! Seeing Botticelli Birth of Venus in person gave me chills.", "ownerName": "Emma Travel", "photos": [], "tags": ["art", "culture", "uffizi"], "comments": []},
     {"id": "r2", "text": "Sunset views from Piazzale Michelangelo were magical - the whole city turned golden!", "ownerName": "Emma Travel", "photos": [], "tags": ["sunset", "views", "piazzale"], "comments": []},
     {"id": "r3", "text": "The Duomo interior with its stunning frescoes left me speechless", "ownerName": "Emma Travel", "photos": [], "tags": ["duomo", "frescoes", "architecture"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to learn more about Renaissance art history after this trip", "ownerName": "Emma Travel", "photos": [], "tags": ["learning", "art", "renaissance"], "comments": []},
     {"id": "b2", "text": "Planning to visit more Medici palaces and gardens next time", "ownerName": "Emma Travel", "photos": [], "tags": ["medici", "palaces", "gardens"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "The crowds at major attractions were overwhelming - barely got peaceful photos", "ownerName": "Emma Travel", "photos": [], "tags": ["crowds", "tourism", "photos"], "comments": []},
     {"id": "t2", "text": "Got completely lost in the maze-like streets of Oltrarno district", "ownerName": "Emma Travel", "photos": [], "tags": ["navigation", "oltrarno", "streets"], "comments": []}
   ]',
   now(), now()),

  -- Marco's Florence trip
  ('fb222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Tuscan Culinary Journey', '2024-07-20', 'food_tour', 'Mercato Centrale', 'Florence', 'Tuscany', 'Italy', 43.7648, 11.2594, false,
   '[
     {"id": "r1", "text": "The bistecca alla fiorentina at Trattoria Mario was absolutely perfect!", "ownerName": "Marco Food", "photos": [], "tags": ["food", "steak", "trattoria"], "comments": []},
     {"id": "r2", "text": "Wine tasting in the Chianti hills - discovered incredible Sangiovese", "ownerName": "Marco Food", "photos": [], "tags": ["wine", "chianti", "sangiovese"], "comments": []},
     {"id": "r3", "text": "Fresh truffle pasta at All Antico Vinaio was a revelation!", "ownerName": "Marco Food", "photos": [], "tags": ["pasta", "truffles", "sandwich"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to return during white truffle season in November", "ownerName": "Marco Food", "photos": [], "tags": ["truffles", "season", "november"], "comments": []},
     {"id": "b2", "text": "Planning to take a cooking class in a Tuscan farmhouse", "ownerName": "Marco Food", "photos": [], "tags": ["cooking", "tuscany", "farmhouse"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Tourist trap restaurants near Duomo had overpriced mediocre food", "ownerName": "Marco Food", "photos": [], "tags": ["tourist trap", "overpriced", "duomo"], "comments": []},
     {"id": "t2", "text": "Struggled to find authentic local spots without advance reservations", "ownerName": "Marco Food", "photos": [], "tags": ["reservations", "authentic", "local"], "comments": []}
   ]',
   now(), now()),

  -- Sophie's Florence trip
  ('fc333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Florence Through the Lens', '2024-09-05', 'photography', 'Ponte Vecchio', 'Florence', 'Tuscany', 'Italy', 43.7678, 11.2530, false,
   '[
     {"id": "r1", "text": "Golden hour at Ponte Vecchio created the most stunning reflections in the Arno", "ownerName": "Sophie Photo", "photos": [], "tags": ["golden hour", "ponte vecchio", "reflections"], "comments": []},
     {"id": "r2", "text": "The intricate details of Santa Croce facade are a photographers dream", "ownerName": "Sophie Photo", "photos": [], "tags": ["santa croce", "details", "facade"], "comments": []},
     {"id": "r3", "text": "Street musicians in Piazza della Repubblica added perfect life to my shots", "ownerName": "Sophie Photo", "photos": [], "tags": ["street music", "piazza", "life"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore the secret passages and hidden courtyards next visit", "ownerName": "Sophie Photo", "photos": [], "tags": ["secret passages", "courtyards", "hidden"], "comments": []},
     {"id": "b2", "text": "Planning a sunrise photography session at Boboli Gardens", "ownerName": "Sophie Photo", "photos": [], "tags": ["sunrise", "boboli", "gardens"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Constant scaffolding and restoration work blocked many iconic views", "ownerName": "Sophie Photo", "photos": [], "tags": ["scaffolding", "restoration", "blocked views"], "comments": []},
     {"id": "t2", "text": "Heavy camera gear became painful on the uneven cobblestone streets", "ownerName": "Sophie Photo", "photos": [], "tags": ["heavy gear", "cobblestones", "painful"], "comments": []}
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
  ('ld444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'Swiss Alpine Thrills', '2024-08-10', 'adventure', 'Mount Pilatus', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9481, 8.3369, false,
   '[
     {"id": "r1", "text": "The worlds steepest cogwheel train to Mount Pilatus was absolutely thrilling!", "ownerName": "James Adventure", "photos": [], "tags": ["cogwheel train", "pilatus", "steep"], "comments": []},
     {"id": "r2", "text": "Swimming in the crystal clear Lake Lucerne at dawn was pure bliss", "ownerName": "James Adventure", "photos": [], "tags": ["swimming", "lake", "dawn"], "comments": []},
     {"id": "r3", "text": "Paragliding over the Swiss Alps gave me the ultimate adrenaline rush!", "ownerName": "James Adventure", "photos": [], "tags": ["paragliding", "alps", "adrenaline"], "comments": []},
     {"id": "r4", "text": "The Dragon Ride cable car journey offered breathtaking panoramic views", "ownerName": "James Adventure", "photos": [], "tags": ["cable car", "dragon ride", "panoramic"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to tackle the challenging Via Ferrata routes in the region", "ownerName": "James Adventure", "photos": [], "tags": ["via ferrata", "challenging", "climbing"], "comments": []},
     {"id": "b2", "text": "Planning to return for winter sports and skiing adventures", "ownerName": "James Adventure", "photos": [], "tags": ["winter sports", "skiing", "snow"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Sudden weather change forced cancellation of planned hiking expedition", "ownerName": "James Adventure", "photos": [], "tags": ["weather", "cancelled", "hiking"], "comments": []},
     {"id": "t2", "text": "Swiss prices for outdoor activities were jaw-droppingly expensive", "ownerName": "James Adventure", "photos": [], "tags": ["expensive", "prices", "activities"], "comments": []}
   ]',
   now(), now()),

  -- Lucia's Lucerne trip
  ('le555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', 'Swiss Architecture Deep Dive', '2024-07-25', 'education', 'Chapel Bridge', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9529, 8.3089, false,
   '[
     {"id": "r1", "text": "Chapel Bridge medieval wooden architecture is an engineering masterpiece", "ownerName": "Lucia Arch", "photos": [], "tags": ["chapel bridge", "medieval", "wooden"], "comments": []},
     {"id": "r2", "text": "The seamless blend of old and new architecture in Lucerne is inspiring", "ownerName": "Lucia Arch", "photos": [], "tags": ["old new blend", "seamless", "inspiring"], "comments": []},
     {"id": "r3", "text": "KKL Culture Centre by Jean Nouvel showcases brilliant modern design", "ownerName": "Lucia Arch", "photos": [], "tags": ["kkl", "jean nouvel", "modern"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to study more examples of sustainable Alpine architecture", "ownerName": "Lucia Arch", "photos": [], "tags": ["sustainable", "alpine", "green"], "comments": []},
     {"id": "b2", "text": "Planning interviews with local architects about traditional techniques", "ownerName": "Lucia Arch", "photos": [], "tags": ["interviews", "local architects", "traditional"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Limited access to interior details of historical buildings", "ownerName": "Lucia Arch", "photos": [], "tags": ["limited access", "interior", "historical"], "comments": []},
     {"id": "t2", "text": "German language barrier hindered deeper architectural discussions", "ownerName": "Lucia Arch", "photos": [], "tags": ["language barrier", "german", "discussions"], "comments": []}
   ]',
   now(), now()),

  -- Thomas's Lucerne trip
  ('lf666666-6666-6666-6666-666666666666', 'f6666666-6666-6666-6666-666666666666', 'Remote Work Swiss Style', '2024-08-30', 'business', 'Lucerne Old Town', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9481, 8.3089, false,
   '[
     {"id": "r1", "text": "Ultra-fast WiFi and modern coworking spaces made remote work seamless", "ownerName": "Thomas Nomad", "photos": [], "tags": ["fast wifi", "coworking", "seamless"], "comments": []},
     {"id": "r2", "text": "The tranquil lake environment dramatically boosted my productivity", "ownerName": "Thomas Nomad", "photos": [], "tags": ["tranquil", "productivity", "lake"], "comments": []},
     {"id": "r3", "text": "Swiss punctuality and efficiency in everything from trains to services", "ownerName": "Thomas Nomad", "photos": [], "tags": ["punctuality", "efficiency", "trains"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore coworking opportunities in Zurich and Basel", "ownerName": "Thomas Nomad", "photos": [], "tags": ["zurich", "basel", "coworking"], "comments": []},
     {"id": "b2", "text": "Planning to attend tech conferences and networking events", "ownerName": "Thomas Nomad", "photos": [], "tags": ["tech conferences", "networking", "events"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Extremely high cost of living made extended stay financially challenging", "ownerName": "Thomas Nomad", "photos": [], "tags": ["high cost", "expensive", "financial"], "comments": []},
     {"id": "t2", "text": "Limited after-work social scene for international remote workers", "ownerName": "Thomas Nomad", "photos": [], "tags": ["limited social", "after work", "international"], "comments": []}
   ]',
   now(), now()),

  -- Olivia's Lucerne trip
  ('lg777777-7777-7777-7777-777777777777', 'g7777777-7777-7777-7777-777777777777', 'Swiss Wine Discovery', '2024-09-12', 'cultural', 'Lake Lucerne Vineyards', 'Lucerne', 'Central Switzerland', 'Switzerland', 46.9529, 8.3089, false,
   '[
     {"id": "r1", "text": "Discovered exceptional Swiss Chasselas wines at lakeside vineyards", "ownerName": "Olivia Wine", "photos": [], "tags": ["chasselas", "lakeside", "vineyards"], "comments": []},
     {"id": "r2", "text": "Traditional alphorn concert at KKL paired perfectly with wine tasting", "ownerName": "Olivia Wine", "photos": [], "tags": ["alphorn", "concert", "pairing"], "comments": []},
     {"id": "r3", "text": "Scenic boat cruise with sommelier-guided tastings was unforgettable", "ownerName": "Olivia Wine", "photos": [], "tags": ["boat cruise", "sommelier", "scenic"], "comments": []}
   ]',
   '[
     {"id": "b1", "text": "Want to explore the Valais wine region and its unique terroir", "ownerName": "Olivia Wine", "photos": [], "tags": ["valais", "terroir", "unique"], "comments": []},
     {"id": "b2", "text": "Planning to learn traditional Swiss winemaking methods", "ownerName": "Olivia Wine", "photos": [], "tags": ["traditional methods", "winemaking", "swiss"], "comments": []}
   ]',
   '[
     {"id": "t1", "text": "Limited Swiss wine varieties compared to neighboring wine regions", "ownerName": "Olivia Wine", "photos": [], "tags": ["limited varieties", "neighboring regions", "comparison"], "comments": []},
     {"id": "t2", "text": "High altitude and weather affected some planned vineyard visits", "ownerName": "Olivia Wine", "photos": [], "tags": ["high altitude", "weather", "vineyard visits"], "comments": []}
   ]',
   now(), now());

-- Create activities for the feed
INSERT INTO activities (
  user_id,
  activity_type,
  target_id,
  target_type,
  data
) VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'rose_added', 'fa111111-1111-1111-1111-111111111111', 'retrospective', '{"title": "Renaissance Magic in Florence", "count": 3}'),
  ('b2222222-2222-2222-2222-222222222222', 'bud_added', 'fb222222-2222-2222-2222-222222222222', 'retrospective', '{"title": "Tuscan Culinary Journey", "count": 2}'),
  ('c3333333-3333-3333-3333-333333333333', 'thorn_added', 'fc333333-3333-3333-3333-333333333333', 'retrospective', '{"title": "Florence Through the Lens", "count": 2}'),
  ('d4444444-4444-4444-4444-444444444444', 'rose_added', 'ld444444-4444-4444-4444-444444444444', 'retrospective', '{"title": "Swiss Alpine Thrills", "count": 4}'),
  ('e5555555-5555-5555-5555-555555555555', 'bud_added', 'le555555-5555-5555-5555-555555555555', 'retrospective', '{"title": "Swiss Architecture Deep Dive", "count": 2}'),
  ('f6666666-6666-6666-6666-666666666666', 'thorn_added', 'lf666666-6666-6666-6666-666666666666', 'retrospective', '{"title": "Remote Work Swiss Style", "count": 2}'),
  ('g7777777-7777-7777-7777-777777777777', 'rose_added', 'lg777777-7777-7777-7777-777777777777', 'retrospective', '{"title": "Swiss Wine Discovery", "count": 3}');

-- Create friendships for better feed interaction
INSERT INTO friendships (user_id, friend_id, status) VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'accepted'),
  ('a1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'accepted'),
  ('b2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', 'accepted'),
  ('c3333333-3333-3333-3333-333333333333', 'e5555555-5555-5555-5555-555555555555', 'accepted'),
  ('d4444444-4444-4444-4444-444444444444', 'f6666666-6666-6666-6666-666666666666', 'accepted'),
  ('e5555555-5555-5555-5555-555555555555', 'g7777777-7777-7777-7777-777777777777', 'accepted'),
  ('f6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'accepted'),
  ('g7777777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', 'accepted');