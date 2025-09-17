-- Create Florence retrospectives for specific users with R/B/T items

DO $$
DECLARE
    michaelbjordan_user_id uuid;
    ashleynshort_user_id uuid;
    florence_retro_1_id uuid := gen_random_uuid();
    florence_retro_2_id uuid := gen_random_uuid();
BEGIN
    -- Get user IDs
    SELECT id INTO michaelbjordan_user_id FROM user_profiles WHERE display_name = 'Michaelbjordan';
    SELECT id INTO ashleynshort_user_id FROM user_profiles WHERE email = 'ashleynshort@gmail.com';
    
    -- Create Florence retro for Michaelbjordan
    INSERT INTO retrospectives (
        id,
        user_id,
        title,
        event_type,
        date,
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
    ) VALUES (
        florence_retro_1_id,
        michaelbjordan_user_id,
        'Florence Adventure',
        'travel',
        '2024-08-15'::date,
        'Florence, Italy',
        'Florence',
        'Tuscany',
        'Italy',
        43.7696,
        11.2558,
        false,
        '[
            {
                "id": "florence-uffizi-rose-1",
                "text": "The Botticelli room was absolutely breathtaking",
                "tags": ["museums", "art", "renaissance"],
                "place_name": "Uffizi Gallery",
                "place_id": "uffizi-gallery-florence"
            },
            {
                "id": "florence-ponte-rose-1", 
                "text": "Golden hour lighting was magical over Ponte Vecchio",
                "tags": ["photography", "sunset", "atmosphere"],
                "place_name": "Ponte Vecchio"
            },
            {
                "id": "florence-food-rose-1",
                "text": "Best gelato I have ever tasted at Vivoli",
                "tags": ["food", "gelato", "local-treats"],
                "place_name": "Vivoli Gelateria"
            }
        ]'::jsonb,
        '[
            {
                "id": "florence-art-bud-1",
                "text": "Want to visit more Medici palaces next time",
                "tags": ["future-plans", "history", "palaces"],
                "place_name": "Florence"
            },
            {
                "id": "florence-cooking-bud-1",
                "text": "Take a proper Italian cooking class",
                "tags": ["cooking", "skills", "italian-cuisine"],
                "place_name": "Florence"
            },
            {
                "id": "florence-shopping-bud-1",
                "text": "Explore the leather markets in San Lorenzo",
                "tags": ["shopping", "crafts", "leather"],
                "place_name": "San Lorenzo Market"
            }
        ]'::jsonb,
        '[
            {
                "id": "florence-crowd-thorn-1",
                "text": "Uffizi was incredibly crowded even with pre-booking",
                "tags": ["crowds", "timing", "frustration"],
                "place_name": "Uffizi Gallery"
            },
            {
                "id": "florence-price-thorn-1",
                "text": "Tourist restaurants near Duomo were overpriced",
                "tags": ["expensive", "tourist-trap", "food"],
                "place_name": "Duomo area"
            },
            {
                "id": "florence-weather-thorn-1",
                "text": "Unexpected rain ruined our planned walking tour",
                "tags": ["weather", "disappointment", "planning"],
                "place_name": "Florence"
            }
        ]'::jsonb,
        NOW(),
        NOW()
    );

    -- Create Florence retro for ashleynshort@gmail.com
    INSERT INTO retrospectives (
        id,
        user_id,
        title,
        event_type,
        date,
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
    ) VALUES (
        florence_retro_2_id,
        ashleynshort_user_id,
        'Florence Cultural Journey',
        'travel',
        '2024-09-10'::date,
        'Florence, Italy',
        'Florence',
        'Tuscany',
        'Italy',
        43.7696,
        11.2558,
        false,
        '[
            {
                "id": "florence-duomo-rose-1",
                "text": "Climbing the Duomo dome was absolutely worth it",
                "tags": ["architecture", "views", "exercise"],
                "place_name": "Cathedral of Santa Maria del Fiore"
            },
            {
                "id": "florence-artisan-rose-1",
                "text": "Watching craftsmen work in Oltrarno was fascinating",
                "tags": ["crafts", "culture", "artisans"],
                "place_name": "Oltrarno District"
            },
            {
                "id": "florence-wine-rose-1",
                "text": "Wine tasting in Chianti countryside was perfect",
                "tags": ["wine", "countryside", "relaxation"],
                "place_name": "Chianti Region"
            }
        ]'::jsonb,
        '[
            {
                "id": "florence-language-bud-1",
                "text": "Learn more Italian before the next visit",
                "tags": ["language", "communication", "improvement"],
                "place_name": "Florence"
            },
            {
                "id": "florence-art-bud-1",
                "text": "Take an art history course to appreciate more",
                "tags": ["education", "art", "appreciation"],
                "place_name": "Florence"
            },
            {
                "id": "florence-hiking-bud-1",
                "text": "Explore the hiking trails around Fiesole",
                "tags": ["hiking", "nature", "exploration"],
                "place_name": "Fiesole"
            }
        ]'::jsonb,
        '[
            {
                "id": "florence-shoes-thorn-1",
                "text": "Wrong shoes made walking on cobblestones painful",
                "tags": ["comfort", "footwear", "preparation"],
                "place_name": "Florence"
            },
            {
                "id": "florence-booking-thorn-1",
                "text": "Could not get into Accademia without advance booking",
                "tags": ["planning", "booking", "disappointment"],
                "place_name": "Accademia Gallery"
            },
            {
                "id": "florence-timing-thorn-1",
                "text": "Underestimated time needed for each museum",
                "tags": ["time-management", "planning", "rushing"],
                "place_name": "Florence"
            }
        ]'::jsonb,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Created Florence retrospectives for both users with R/B/T items';

END $$;