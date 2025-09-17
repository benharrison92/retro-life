-- Add Florence and Lucerne retrospectives to existing users
-- This adds new trip data without overwriting any existing data

DO $$
DECLARE
    user_ids uuid[] := ARRAY[
        '2b39266f-f524-4dae-a353-e3836868a09c'::uuid,
        '50cd153f-7727-4a90-b064-dfd8ab240a60'::uuid,
        '52a368a5-4612-4dd9-b115-6fcc484d2013'::uuid,
        '31f1a2e3-b050-49b6-bf2c-e68a79931daf'::uuid,
        'f699d3c8-3d0f-4425-b624-7c546472bea5'::uuid,
        'd761b030-1958-4d83-9146-5cd35ed1882b'::uuid,
        '1e734f5f-5207-4772-876d-17be67f64eed'::uuid
    ];
    
    florence_retro1_id uuid := gen_random_uuid();
    florence_retro2_id uuid := gen_random_uuid();
    florence_retro3_id uuid := gen_random_uuid();
    lucerne_retro1_id uuid := gen_random_uuid();
    lucerne_retro2_id uuid := gen_random_uuid();
    lucerne_retro3_id uuid := gen_random_uuid();
    lucerne_retro4_id uuid := gen_random_uuid();
BEGIN
    -- Florence retrospectives for different users
    INSERT INTO public.retrospectives (id, user_id, title, date, event_type, location_name, city, country, latitude, longitude, is_private, roses, buds, thorns) VALUES
    (florence_retro1_id, user_ids[1], 'Uffizi Gallery Visit', '2024-08-15', 'museum', 'Uffizi Gallery', 'Florence', 'Italy', 43.7678, 11.2553, false,
     '["The Botticelli room was absolutely breathtaking", "Learned so much about Renaissance art", "Perfect lighting for photos"]'::jsonb,
     '["Want to visit more Medici sites", "Plan to take an art history course", "Explore more hidden courtyards"]'::jsonb,
     '["Too crowded in the morning", "Audio guide was confusing", "Long wait time for tickets"]'::jsonb),
    
    (florence_retro2_id, user_ids[2], 'Ponte Vecchio Sunset', '2024-08-16', 'sightseeing', 'Ponte Vecchio', 'Florence', 'Italy', 43.7679, 11.2530, false,
     '["Golden hour lighting was magical", "Great street musicians", "Amazing jewelry shops"]'::jsonb,
     '["Return for sunrise photos", "Try the nearby gelato shop", "Explore the Oltrarno district"]'::jsonb,
     '["Very touristy and expensive", "Hard to get good photos with crowds", "Some pushy vendors"]'::jsonb),
    
    (florence_retro3_id, user_ids[3], 'Tuscan Cooking Class', '2024-08-17', 'activity', 'Cooking Studio Firenze', 'Florence', 'Italy', 43.7696, 11.2558, false,
     '["Made perfect handmade pasta", "Chef was incredibly knowledgeable", "Great wine pairing"]'::jsonb,
     '["Practice making gnocchi at home", "Visit local markets for ingredients", "Book another cooking class"]'::jsonb,
     '["Kitchen was quite hot", "Some ingredients were hard to find", "Class ran longer than expected"]'::jsonb);

    -- Lucerne retrospectives for different users
    INSERT INTO public.retrospectives (id, user_id, title, date, event_type, location_name, city, country, latitude, longitude, is_private, roses, buds, thorns) VALUES
    (lucerne_retro1_id, user_ids[4], 'Mount Pilatus Adventure', '2024-09-05', 'outdoor', 'Mount Pilatus', 'Lucerne', 'Switzerland', 46.9784, 8.2525, false,
     '["Cable car ride was spectacular", "360-degree mountain views", "Perfect weather conditions"]'::jsonb,
     '["Try paragliding next time", "Hike more mountain trails", "Visit during different seasons"]'::jsonb,
     '["Expensive cable car tickets", "Crowded observation deck", "Limited food options on top"]'::jsonb),
    
    (lucerne_retro2_id, user_ids[5], 'Chapel Bridge Walk', '2024-09-06', 'sightseeing', 'Chapel Bridge', 'Lucerne', 'Switzerland', 47.0502, 8.3093, false,
     '["Beautiful painted panels", "Historic charm of the bridge", "Great photo opportunities"]'::jsonb,
     '["Learn more about local history", "Visit the Water Tower museum", "Explore old town further"]'::jsonb,
     '["Bridge was under partial renovation", "Tourist groups blocking views", "Some panels were faded"]'::jsonb),
    
    (lucerne_retro3_id, user_ids[6], 'Lake Lucerne Cruise', '2024-09-07', 'outdoor', 'Lake Lucerne', 'Lucerne', 'Switzerland', 47.0379, 8.3000, false,
     '["Crystal clear lake waters", "Stunning Alpine scenery", "Peaceful and relaxing"]'::jsonb,
     '["Take a longer cruise route", "Try swimming in the lake", "Visit lakeside villages"]'::jsonb,
     '["Weather turned cloudy midway", "Limited onboard dining", "Short duration for the price"]'::jsonb),
    
    (lucerne_retro4_id, user_ids[7], 'Swiss Chocolate Tasting', '2024-09-08', 'food', 'Läderach Chocolaterie', 'Lucerne', 'Switzerland', 47.0502, 8.3083, false,
     '["Incredible variety of flavors", "Expert chocolatier guide", "Free samples were generous"]'::jsonb,
     '["Learn chocolate making techniques", "Visit cocoa farms someday", "Try making chocolates at home"]'::jsonb,
     '["Very expensive prices", "Some chocolates too sweet", "Limited seating area"]'::jsonb);

    -- Create activities for the new retrospectives
    INSERT INTO public.activities (user_id, activity_type, target_id, target_type, data) VALUES
    (user_ids[1], 'retro_created', florence_retro1_id, 'retrospective', '{"title": "Uffizi Gallery Visit", "event_type": "museum"}'::jsonb),
    (user_ids[2], 'retro_created', florence_retro2_id, 'retrospective', '{"title": "Ponte Vecchio Sunset", "event_type": "sightseeing"}'::jsonb),
    (user_ids[3], 'retro_created', florence_retro3_id, 'retrospective', '{"title": "Tuscan Cooking Class", "event_type": "activity"}'::jsonb),
    (user_ids[4], 'retro_created', lucerne_retro1_id, 'retrospective', '{"title": "Mount Pilatus Adventure", "event_type": "outdoor"}'::jsonb),
    (user_ids[5], 'retro_created', lucerne_retro2_id, 'retrospective', '{"title": "Chapel Bridge Walk", "event_type": "sightseeing"}'::jsonb),
    (user_ids[6], 'retro_created', lucerne_retro3_id, 'retrospective', '{"title": "Lake Lucerne Cruise", "event_type": "outdoor"}'::jsonb),
    (user_ids[7], 'retro_created', lucerne_retro4_id, 'retrospective', '{"title": "Swiss Chocolate Tasting", "event_type": "food"}'::jsonb);

END $$;