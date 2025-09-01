-- Fix the prevent_retro_cycles function to properly handle SELECT
CREATE OR REPLACE FUNCTION public.prevent_retro_cycles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the new parent is a descendant of this retro
        IF EXISTS (
            WITH RECURSIVE retro_tree AS (
                -- Start with the current retro
                SELECT id, parent_id, 1 as level
                FROM retrospectives 
                WHERE id = NEW.id
                
                UNION ALL
                
                -- Recursively find all descendants
                SELECT r.id, r.parent_id, rt.level + 1
                FROM retrospectives r
                INNER JOIN retro_tree rt ON r.parent_id = rt.id
                WHERE rt.level < 10 -- Prevent infinite loops
            )
            SELECT 1 FROM retro_tree WHERE id = NEW.parent_id
        ) THEN
            RAISE EXCEPTION 'Cannot set parent: would create a cycle in retro hierarchy';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;