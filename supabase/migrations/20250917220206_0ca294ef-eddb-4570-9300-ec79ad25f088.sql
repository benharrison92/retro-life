-- Create 7 new fake users with completely new UUIDs and their retrospectives
-- This will not overwrite any existing data

DO $$
DECLARE
    user1_id uuid := gen_random_uuid();
    user2_id uuid := gen_random_uuid();
    user3_id uuid := gen_random_uuid();
    user4_id uuid := gen_random_uuid();
    user5_id uuid := gen_random_uuid();
    user6_id uuid := gen_random_uuid();
    user7_id uuid := gen_random_uuid();
    
    florence_retro1_id uuid := gen_random_uuid();
    florence_retro2_id uuid := gen_random_uuid();
    florence_retro3_id uuid := gen_random_uuid();
    lucerne_retro1_id uuid := gen_random_uuid();
    lucerne_retro2_id uuid := gen_random_uuid();
    lucerne_retro3_id uuid := gen_random_uuid();
    lucerne_retro4_id uuid := gen_random_uuid();
BEGIN
    -- Insert 7 new fake user profiles
    INSERT INTO public.user_profiles (id, email, display_name, bio, avatar_url) VALUES
    (user1_id, 'sofia.travel@example.com', 'Sofia Martinez', 'Adventure seeker and food lover exploring Europe', 'https://images.unsplash.com/photo-1494790108755-2616b612b4c8?w=150'),
    (user2_id, 'marco.wanderer@example.com', 'Marco Rossi', 'Italian photographer capturing beautiful moments', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    (user3_id, 'emma.explorer@example.com', 'Emma Thompson', 'History enthusiast and museum curator', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
    (user4_id, 'luca.foodie@example.com', 'Luca Bianchi', 'Chef discovering culinary treasures across Europe', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
    (user5_id, 'anna.artist@example.com', 'Anna Schmidt', 'Digital artist inspired by Renaissance art', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
    (user6_id, 'pierre.guide@example.com', 'Pierre Dubois', 'Local guide sharing hidden gems of Switzerland', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
    (user7_id, 'maria.writer@example.com', 'Maria Gonzalez', 'Travel writer documenting European adventures', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150');

    -- Florence retrospectives
    INSERT INTO public.retrospectives (id, user_id, title, date, event_type, location_name, city, country, latitude, longitude, is_private, roses, buds, thorns) VALUES
    (florence_retro1_id, user1_id, 'Uffizi Gallery Visit', '2024-08-15', 'museum', 'Uffizi Gallery', 'Florence', 'Italy', 43.7678, 11.2553, false,
     '["The Botticelli room was absolutely breathtaking", "Learned so much about Renaissance art", "Perfect lighting for photos"]'::jsonb,
     '["Want to visit more Medici sites", "Plan to take an art history course", "Explore more hidden courtyards"]'::jsonb,
     '["Too crowded in the morning", "Audio guide was confusing", "Long wait time for tickets"]'::jsonb),
    
    (florence_retro2_id, user2_id, 'Ponte Vecchio Sunset', '2024-08-16', 'sightseeing', 'Ponte Vecchio', 'Florence', 'Italy', 43.7679, 11.2530, false,
     '["Golden hour lighting was magical", "Great street musicians", "Amazing jewelry shops"]'::jsonb,
     '["Return for sunrise photos", "Try the nearby gelato shop", "Explore the Oltrarno district"]'::jsonb,
     '["Very touristy and expensive", "Hard to get good photos with crowds", "Some pushy vendors"]'::jsonb),
    
    (florence_retro3_id, user3_id, 'Tuscan Cooking Class', '2024-08-17', 'activity', 'Cooking Studio Firenze', 'Florence', 'Italy', 43.7696, 11.2558, false,
     '["Made perfect handmade pasta", "Chef was incredibly knowledgeable", "Great wine pairing"]'::jsonb,
     '["Practice making gnocchi at home", "Visit local markets for ingredients", "Book another cooking class"]'::jsonb,
     '["Kitchen was quite hot", "Some ingredients were hard to find", "Class ran longer than expected"]'::jsonb);

    -- Lucerne retrospectives
    INSERT INTO public.retrospectives (id, user_id, title, date, event_type, location_name, city, country, latitude, longitude, is_private, roses, buds, thorns) VALUES
    (lucerne_retro1_id, user4_id, 'Mount Pilatus Adventure', '2024-09-05', 'outdoor', 'Mount Pilatus', 'Lucerne', 'Switzerland', 46.9784, 8.2525, false,
     '["Cable car ride was spectacular", "360-degree mountain views", "Perfect weather conditions"]'::jsonb,
     '["Try paragliding next time", "Hike more mountain trails", "Visit during different seasons"]'::jsonb,
     '["Expensive cable car tickets", "Crowded observation deck", "Limited food options on top"]'::jsonb),
    
    (lucerne_retro2_id, user5_id, 'Chapel Bridge Walk', '2024-09-06', 'sightseeing', 'Chapel Bridge', 'Lucerne', 'Switzerland', 47.0502, 8.3093, false,
     '["Beautiful painted panels", "Historic charm of the bridge", "Great photo opportunities"]'::jsonb,
     '["Learn more about local history", "Visit the Water Tower museum", "Explore old town further"]'::jsonb,
     '["Bridge was under partial renovation", "Tourist groups blocking views", "Some panels were faded"]'::jsonb),
    
    (lucerne_retro3_id, user6_id, 'Lake Lucerne Cruise', '2024-09-07', 'outdoor', 'Lake Lucerne', 'Lucerne', 'Switzerland', 47.0379, 8.3000, false,
     '["Crystal clear lake waters", "Stunning Alpine scenery", "Peaceful and relaxing"]'::jsonb,
     '["Take a longer cruise route", "Try swimming in the lake", "Visit lakeside villages"]'::jsonb,
     '["Weather turned cloudy midway", "Limited onboard dining", "Short duration for the price"]'::jsonb),
    
    (lucerne_retro4_id, user7_id, 'Swiss Chocolate Tasting', '2024-09-08', 'food', 'Läderach Chocolaterie', 'Lucerne', 'Switzerland', 47.0502, 8.3083, false,
     '["Incredible variety of flavors", "Expert chocolatier guide", "Free samples were generous"]'::jsonb,
     '["Learn chocolate making techniques", "Visit cocoa farms someday", "Try making chocolates at home"]'::jsonb,
     '["Very expensive prices", "Some chocolates too sweet", "Limited seating area"]'::jsonb);

    -- Create some activities for engagement
    INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data) VALUES
    (user1_id, 'retro_created', florence_retro1_id, 'retrospective', '{"title": "Uffizi Gallery Visit", "event_type": "museum"}'::jsonb),
    (user2_id, 'retro_created', florence_retro2_id, 'retrospective', '{"title": "Ponte Vecchio Sunset", "event_type": "sightseeing"}'::jsonb),
    (user3_id, 'retro_created', florence_retro3_id, 'retrospective', '{"title": "Tuscan Cooking Class", "event_type": "activity"}'::jsonb),
    (user4_id, 'retro_created', lucerne_retro1_id, 'retrospective', '{"title": "Mount Pilatus Adventure", "event_type": "outdoor"}'::jsonb),
    (user5_id, 'retro_created', lucerne_retro2_id, 'retrospective', '{"title": "Chapel Bridge Walk", "event_type": "sightseeing"}'::jsonb),
    (user6_id, 'retro_created', lucerne_retro3_id, 'retrospective', '{"title": "Lake Lucerne Cruise", "event_type": "outdoor"}'::jsonb),
    (user7_id, 'retro_created', lucerne_retro4_id, 'retrospective', '{"title": "Swiss Chocolate Tasting", "event_type": "food"}'::jsonb);

    -- Create some friendships between the new users
    INSERT INTO public.friendships (user_id, friend_id, status) VALUES
    (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id), 'accepted'),
    (LEAST(user2_id, user3_id), GREATEST(user2_id, user3_id), 'accepted'),
    (LEAST(user4_id, user5_id), GREATEST(user4_id, user5_id), 'accepted'),
    (LEAST(user5_id, user6_id), GREATEST(user5_id, user6_id), 'accepted'),
    (LEAST(user6_id, user7_id), GREATEST(user6_id, user7_id), 'accepted'),
    (LEAST(user1_id, user4_id), GREATEST(user1_id, user4_id), 'accepted');

END $$;