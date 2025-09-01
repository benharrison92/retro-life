-- Add parent_id to existing retrospectives table for hierarchical organization
ALTER TABLE public.retrospectives 
ADD COLUMN parent_id UUID REFERENCES public.retrospectives(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_retrospectives_parent_id ON public.retrospectives(parent_id);

-- Function to prevent cycles in retro hierarchy
CREATE OR REPLACE FUNCTION public.prevent_retro_cycles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the new parent is a descendant of this retro
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
        SELECT 1 FROM retro_tree WHERE id = NEW.parent_id;
        
        IF FOUND THEN
            RAISE EXCEPTION 'Cannot set parent: would create a cycle in retro hierarchy';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to prevent cycles
DROP TRIGGER IF EXISTS trigger_prevent_retro_cycles ON retrospectives;
CREATE TRIGGER trigger_prevent_retro_cycles
    BEFORE INSERT OR UPDATE ON retrospectives
    FOR EACH ROW EXECUTE FUNCTION prevent_retro_cycles();

-- Function to get retro breadcrumb path
CREATE OR REPLACE FUNCTION public.get_retro_breadcrumb(retro_uuid uuid)
RETURNS TABLE(id uuid, title text, level integer) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE breadcrumb AS (
        -- Start with the target retro
        SELECT r.id, r.title, r.parent_id, 0 as level
        FROM retrospectives r 
        WHERE r.id = retro_uuid
        
        UNION ALL
        
        -- Recursively get parents
        SELECT r.id, r.title, r.parent_id, b.level + 1
        FROM retrospectives r
        INNER JOIN breadcrumb b ON r.id = b.parent_id
        WHERE b.level < 10 -- Prevent infinite loops
    )
    SELECT b.id, b.title, b.level 
    FROM breadcrumb b
    ORDER BY b.level DESC; -- Root first, then descendants
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;