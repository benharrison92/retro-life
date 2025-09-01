-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION update_node_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = NEW.id::text;
    ELSE
        SELECT path INTO parent_path FROM retro_nodes WHERE id = NEW.parent_id;
        NEW.path = parent_path || '/' || NEW.id::text;
    END IF;
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION prevent_node_cycles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the new parent is a descendant of this node
        IF EXISTS (
            SELECT 1 FROM retro_nodes 
            WHERE path LIKE (OLD.path || '/%') 
            AND id = NEW.parent_id
        ) THEN
            RAISE EXCEPTION 'Cannot move node: would create a cycle';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION ensure_single_current_rbt()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        -- Set all other entries for this node/author to not current
        UPDATE rbt_entries 
        SET is_current = false 
        WHERE node_id = NEW.node_id 
        AND author_id = NEW.author_id 
        AND id != COALESCE(NEW.id, gen_random_uuid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;