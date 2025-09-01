-- Create hierarchical retro system tables

-- Node types enum
DO $$ BEGIN
    CREATE TYPE node_type AS ENUM ('TRIP', 'CATEGORY', 'CITY', 'VENUE', 'EVENT', 'NOTEBOOK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visibility_type AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main retro_nodes table
CREATE TABLE IF NOT EXISTS public.retro_nodes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES public.retro_nodes(id) ON DELETE CASCADE,
    type node_type NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    start_date DATE,
    end_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    order_index INTEGER DEFAULT 0,
    path TEXT, -- Materialized path for fast subtree queries
    visibility visibility_type DEFAULT 'PRIVATE',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RBT entries table
CREATE TABLE IF NOT EXISTS public.rbt_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID REFERENCES public.retro_nodes(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    rose TEXT,
    bud TEXT,
    thorn TEXT,
    visibility visibility_type DEFAULT 'PRIVATE',
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Node attachments table
CREATE TABLE IF NOT EXISTS public.node_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID REFERENCES public.retro_nodes(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Node tags table
CREATE TABLE IF NOT EXISTS public.node_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    node_id UUID REFERENCES public.retro_nodes(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(node_id, tag)
);

-- Enable RLS
ALTER TABLE public.retro_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbt_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retro_nodes
CREATE POLICY "Users can create their own nodes" ON public.retro_nodes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own nodes" ON public.retro_nodes
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view public nodes" ON public.retro_nodes
    FOR SELECT USING (visibility = 'PUBLIC');

CREATE POLICY "Users can view friends nodes" ON public.retro_nodes
    FOR SELECT USING (
        visibility = 'FRIENDS' AND 
        EXISTS (
            SELECT 1 FROM friendships 
            WHERE ((user_id = auth.uid() AND friend_id = created_by) OR 
                   (friend_id = auth.uid() AND user_id = created_by)) 
            AND status = 'accepted'
        )
    );

CREATE POLICY "Users can update their own nodes" ON public.retro_nodes
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own nodes" ON public.retro_nodes
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for rbt_entries
CREATE POLICY "Users can create their own RBT entries" ON public.rbt_entries
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can view their own RBT entries" ON public.rbt_entries
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can view public RBT entries" ON public.rbt_entries
    FOR SELECT USING (visibility = 'PUBLIC');

CREATE POLICY "Users can view friends RBT entries" ON public.rbt_entries
    FOR SELECT USING (
        visibility = 'FRIENDS' AND 
        EXISTS (
            SELECT 1 FROM friendships 
            WHERE ((user_id = auth.uid() AND friend_id = author_id) OR 
                   (friend_id = auth.uid() AND user_id = author_id)) 
            AND status = 'accepted'
        )
    );

CREATE POLICY "Users can update their own RBT entries" ON public.rbt_entries
    FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for node_attachments
CREATE POLICY "Users can manage attachments for their nodes" ON public.node_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM retro_nodes 
            WHERE retro_nodes.id = node_attachments.node_id 
            AND retro_nodes.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view public node attachments" ON public.node_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM retro_nodes 
            WHERE retro_nodes.id = node_attachments.node_id 
            AND retro_nodes.visibility = 'PUBLIC'
        )
    );

-- RLS Policies for node_tags
CREATE POLICY "Users can manage tags for their nodes" ON public.node_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM retro_nodes 
            WHERE retro_nodes.id = node_tags.node_id 
            AND retro_nodes.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can view public node tags" ON public.node_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM retro_nodes 
            WHERE retro_nodes.id = node_tags.node_id 
            AND retro_nodes.visibility = 'PUBLIC'
        )
    );

-- Function to update materialized path
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
$$ LANGUAGE plpgsql;

-- Function to prevent cycles
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
$$ LANGUAGE plpgsql;

-- Function to ensure only one current RBT entry per user/node
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
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_update_node_path ON retro_nodes;
CREATE TRIGGER trigger_update_node_path
    BEFORE INSERT OR UPDATE ON retro_nodes
    FOR EACH ROW EXECUTE FUNCTION update_node_path();

DROP TRIGGER IF EXISTS trigger_prevent_node_cycles ON retro_nodes;
CREATE TRIGGER trigger_prevent_node_cycles
    BEFORE UPDATE ON retro_nodes
    FOR EACH ROW EXECUTE FUNCTION prevent_node_cycles();

DROP TRIGGER IF EXISTS trigger_ensure_single_current_rbt ON rbt_entries;
CREATE TRIGGER trigger_ensure_single_current_rbt
    BEFORE INSERT OR UPDATE ON rbt_entries
    FOR EACH ROW EXECUTE FUNCTION ensure_single_current_rbt();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on retro_nodes
DROP TRIGGER IF EXISTS update_retro_nodes_updated_at ON retro_nodes;
CREATE TRIGGER update_retro_nodes_updated_at
    BEFORE UPDATE ON retro_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retro_nodes_path ON retro_nodes USING btree(path);
CREATE INDEX IF NOT EXISTS idx_retro_nodes_parent_id ON retro_nodes USING btree(parent_id);
CREATE INDEX IF NOT EXISTS idx_retro_nodes_created_by ON retro_nodes USING btree(created_by);
CREATE INDEX IF NOT EXISTS idx_rbt_entries_node_author ON rbt_entries USING btree(node_id, author_id);
CREATE INDEX IF NOT EXISTS idx_rbt_entries_current ON rbt_entries USING btree(node_id, is_current);
CREATE INDEX IF NOT EXISTS idx_node_tags_tag ON node_tags USING btree(tag);
CREATE INDEX IF NOT EXISTS idx_node_attachments_node ON node_attachments USING btree(node_id);