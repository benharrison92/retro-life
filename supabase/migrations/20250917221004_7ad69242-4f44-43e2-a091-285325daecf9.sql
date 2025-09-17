-- Fix the Florence and Lucerne data structure
-- Convert separate retrospectives into R/B/T items within main Florence and Lucerne retros

DO $$
DECLARE
    florence_main_retro_id uuid := 'b35a7db7-1913-4588-b73e-e5165399350e';
    lucerne_main_retro_id uuid := '591d9da2-e973-4706-9aae-4e9592c42d20';
    
    -- Current roses, buds, thorns from main retros
    florence_current_roses jsonb;
    florence_current_buds jsonb;
    florence_current_thorns jsonb;
    lucerne_current_roses jsonb;
    lucerne_current_buds jsonb;
    lucerne_current_thorns jsonb;
    
    -- New R/B/T items to add
    florence_new_items jsonb := '[
        {
            "id": "florence-uffizi-1",
            "text": "The Botticelli room was absolutely breathtaking",
            "tags": ["museums", "art", "renaissance"],
            "place_name": "Uffizi Gallery",
            "place_id": "uffizi-gallery-florence"
        },
        {
            "id": "florence-uffizi-2", 
            "text": "Learned so much about Renaissance art",
            "tags": ["education", "art", "history"],
            "place_name": "Uffizi Gallery"
        },
        {
            "id": "florence-ponte-1",
            "text": "Golden hour lighting was magical",
            "tags": ["photography", "sunset", "atmosphere"],
            "place_name": "Ponte Vecchio"
        },
        {
            "id": "florence-cooking-1",
            "text": "Made perfect handmade pasta",
            "tags": ["cooking", "food", "italian-cuisine"],
            "place_name": "Cooking Studio Firenze"
        }
    ]'::jsonb;
    
    florence_new_buds jsonb := '[
        {
            "id": "florence-uffizi-bud-1",
            "text": "Want to visit more Medici sites",
            "tags": ["future-plans", "history"],
            "place_name": "Florence"
        },
        {
            "id": "florence-ponte-bud-1",
            "text": "Return for sunrise photos",
            "tags": ["photography", "sunrise"],
            "place_name": "Ponte Vecchio"
        },
        {
            "id": "florence-cooking-bud-1",
            "text": "Practice making gnocchi at home",
            "tags": ["cooking", "practice"],
            "place_name": "Home"
        }
    ]'::jsonb;
    
    florence_new_thorns jsonb := '[
        {
            "id": "florence-uffizi-thorn-1",
            "text": "Too crowded in the morning",
            "tags": ["crowds", "timing"],
            "place_name": "Uffizi Gallery"
        },
        {
            "id": "florence-ponte-thorn-1",
            "text": "Very touristy and expensive",
            "tags": ["tourist-trap", "expensive"],
            "place_name": "Ponte Vecchio"
        },
        {
            "id": "florence-cooking-thorn-1",
            "text": "Kitchen was quite hot",
            "tags": ["comfort", "temperature"],
            "place_name": "Cooking Studio Firenze"
        }
    ]'::jsonb;
    
    lucerne_new_roses jsonb := '[
        {
            "id": "lucerne-pilatus-1",
            "text": "Cable car ride was spectacular",
            "tags": ["transportation", "views", "mountains"],
            "place_name": "Mount Pilatus"
        },
        {
            "id": "lucerne-bridge-1",
            "text": "Beautiful painted panels",
            "tags": ["art", "history", "architecture"],
            "place_name": "Chapel Bridge"
        },
        {
            "id": "lucerne-lake-1",
            "text": "Crystal clear lake waters",
            "tags": ["nature", "water", "pristine"],
            "place_name": "Lake Lucerne"
        },
        {
            "id": "lucerne-chocolate-1",
            "text": "Incredible variety of flavors",
            "tags": ["food", "chocolate", "variety"],
            "place_name": "Läderach Chocolaterie"
        }
    ]'::jsonb;
    
    lucerne_new_buds jsonb := '[
        {
            "id": "lucerne-pilatus-bud-1",
            "text": "Try paragliding next time",
            "tags": ["adventure", "future-plans"],
            "place_name": "Mount Pilatus"
        },
        {
            "id": "lucerne-bridge-bud-1",
            "text": "Learn more about local history",
            "tags": ["education", "history"],
            "place_name": "Lucerne"
        },
        {
            "id": "lucerne-lake-bud-1",
            "text": "Take a longer cruise route",
            "tags": ["future-plans", "exploration"],
            "place_name": "Lake Lucerne"
        },
        {
            "id": "lucerne-chocolate-bud-1",
            "text": "Learn chocolate making techniques",
            "tags": ["education", "skills", "food"],
            "place_name": "Chocolaterie"
        }
    ]'::jsonb;
    
    lucerne_new_thorns jsonb := '[
        {
            "id": "lucerne-pilatus-thorn-1",
            "text": "Expensive cable car tickets",
            "tags": ["expensive", "transportation"],
            "place_name": "Mount Pilatus"
        },
        {
            "id": "lucerne-bridge-thorn-1",
            "text": "Bridge was under partial renovation",
            "tags": ["construction", "incomplete"],
            "place_name": "Chapel Bridge"
        },
        {
            "id": "lucerne-lake-thorn-1",
            "text": "Weather turned cloudy midway",
            "tags": ["weather", "disappointing"],
            "place_name": "Lake Lucerne"
        },
        {
            "id": "lucerne-chocolate-thorn-1",
            "text": "Very expensive prices",
            "tags": ["expensive", "budget"],
            "place_name": "Läderach Chocolaterie"
        }
    ]'::jsonb;
    
BEGIN
    -- Get current R/B/T data from main retrospectives
    SELECT roses, buds, thorns INTO florence_current_roses, florence_current_buds, florence_current_thorns
    FROM retrospectives WHERE id = florence_main_retro_id;
    
    SELECT roses, buds, thorns INTO lucerne_current_roses, lucerne_current_buds, lucerne_current_thorns
    FROM retrospectives WHERE id = lucerne_main_retro_id;
    
    -- Update Florence retrospective with combined R/B/T items
    UPDATE retrospectives 
    SET 
        roses = COALESCE(florence_current_roses, '[]'::jsonb) || florence_new_items,
        buds = COALESCE(florence_current_buds, '[]'::jsonb) || florence_new_buds,
        thorns = COALESCE(florence_current_thorns, '[]'::jsonb) || florence_new_thorns,
        updated_at = NOW()
    WHERE id = florence_main_retro_id;
    
    -- Update Lucerne retrospective with combined R/B/T items  
    UPDATE retrospectives 
    SET 
        roses = COALESCE(lucerne_current_roses, '[]'::jsonb) || lucerne_new_roses,
        buds = COALESCE(lucerne_current_buds, '[]'::jsonb) || lucerne_new_buds,
        thorns = COALESCE(lucerne_current_thorns, '[]'::jsonb) || lucerne_new_thorns,
        updated_at = NOW()
    WHERE id = lucerne_main_retro_id;
    
    -- Delete the incorrectly created separate retrospectives (but keep activities)
    DELETE FROM retrospectives WHERE id IN (
        'b5a21f65-827c-4d99-9891-f7c62a11e774', -- Uffizi Gallery Visit
        '7d13cec5-8bc4-46eb-9fcb-208e2c3f7ac8', -- Ponte Vecchio Sunset  
        'b3c77d03-7c9b-4f67-a42f-57737ea245bc', -- Tuscan Cooking Class
        '2f25bbb5-08d2-457c-88b6-39e0f3e456da', -- Mount Pilatus Adventure
        '306b1b9a-32af-44d9-979f-615865cf477b', -- Lake Lucerne Cruise
        '99f3deb8-d41d-4e17-826c-205cd1497cbc', -- Uffizi Gallery Visit (duplicate)
        '8a5e0a67-aec0-4c4f-baa7-a2acb7724a8f', -- Ponte Vecchio Sunset (duplicate)
        '9ebc7f7d-7e71-48de-9ffb-5895c81bc612', -- Tuscan Cooking Class (duplicate)
        '5a58a625-cedb-44f7-b0ee-b967f367a89c', -- Mount Pilatus Adventure (duplicate)
        '913bb58f-283f-4f73-9f98-91e643d9b77e', -- Chapel Bridge Walk
        'c2ef8f21-e915-41af-904b-dd71b9a977ba', -- Swiss Chocolate Tasting
        '3b9b89c0-5db5-456e-beed-ba35cea71317', -- Swiss Chocolate Tasting (duplicate)
        '6930255f-dc73-4e7e-b575-045da0af4499', -- Chapel Bridge Walk (duplicate)
        'e5e22cda-507a-4bf1-a486-2c03b223c39b'  -- Lake Lucerne Cruise (duplicate)
    );
    
    RAISE NOTICE 'Successfully restructured Florence and Lucerne retrospectives with R/B/T items';
    
END $$;