import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface RetroNode {
  id: string;
  parent_id?: string | null;
  type: 'TRIP' | 'CATEGORY' | 'CITY' | 'VENUE' | 'EVENT' | 'NOTEBOOK';
  title: string;
  subtitle?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  metadata: any;
  order_index: number | null;
  path: string | null;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  children?: RetroNode[];
}

export interface RBTEntry {
  id: string;
  node_id: string;
  author_id: string;
  rose?: string;
  bud?: string;
  thorn?: string;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  is_current: boolean;
  created_at: string;
}

export const useRetroNodes = () => {
  const [nodes, setNodes] = useState<RetroNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all nodes and build hierarchy
  const fetchNodes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('retro_nodes')
        .select('*')
        .order('path', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Build hierarchy
      const nodeMap = new Map<string, RetroNode>();
      const rootNodes: RetroNode[] = [];

      // First pass: create node map
      data.forEach(node => {
        nodeMap.set(node.id, { 
          ...node, 
          children: [],
          metadata: node.metadata || {},
          order_index: node.order_index || 0,
          path: node.path || '',
          visibility: (node.visibility as 'PUBLIC' | 'FRIENDS' | 'PRIVATE') || 'PRIVATE'
        });
      });

      // Second pass: build hierarchy
      data.forEach(node => {
        const nodeWithChildren = nodeMap.get(node.id)!;
        if (node.parent_id) {
          const parent = nodeMap.get(node.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(nodeWithChildren);
          }
        } else {
          rootNodes.push(nodeWithChildren);
        }
      });

      setNodes(rootNodes);
    } catch (error) {
      console.error('Error fetching nodes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch retro nodes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch subtree for a specific node
  const fetchSubtree = useCallback(async (rootPath: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('retro_nodes')
        .select('*')
        .like('path', `${rootPath}%`)
        .order('path', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subtree:', error);
      return [];
    }
  }, [user]);

  // Create new node
  const createNode = useCallback(async (node: Partial<RetroNode>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('retro_nodes')
        .insert({
          parent_id: node.parent_id || null,
          type: node.type || 'TRIP',
          title: node.title || 'Untitled',
          subtitle: node.subtitle || null,
          start_date: node.start_date || null,
          end_date: node.end_date || null,
          metadata: node.metadata || {},
          order_index: node.order_index || 0,
          visibility: node.visibility || 'PRIVATE',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchNodes(); // Refresh the tree
      
      toast({
        title: "Success",
        description: "Node created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating node:', error);
      toast({
        title: "Error",
        description: "Failed to create node",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchNodes, toast]);

  // Update node
  const updateNode = useCallback(async (id: string, updates: Partial<RetroNode>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('retro_nodes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchNodes(); // Refresh the tree
      
      toast({
        title: "Success",
        description: "Node updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating node:', error);
      toast({
        title: "Error",
        description: "Failed to update node",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchNodes, toast]);

  // Delete node
  const deleteNode = useCallback(async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('retro_nodes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNodes(); // Refresh the tree
      
      toast({
        title: "Success",
        description: "Node deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting node:', error);
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchNodes, toast]);

  // Fetch RBT entries for a node
  const fetchRBTEntries = useCallback(async (nodeId: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('rbt_entries')
        .select('*')
        .eq('node_id', nodeId)
        .eq('is_current', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching RBT entries:', error);
      return [];
    }
  }, [user]);

  // Create or update RBT entry
  const saveRBTEntry = useCallback(async (entry: Partial<RBTEntry>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('rbt_entries')
        .insert({
          node_id: entry.node_id!,
          author_id: user.id,
          rose: entry.rose || null,
          bud: entry.bud || null,
          thorn: entry.thorn || null,
          visibility: entry.visibility || 'PRIVATE',
          is_current: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "RBT entry saved successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error saving RBT entry:', error);
      toast({
        title: "Error",
        description: "Failed to save RBT entry",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return {
    nodes,
    loading,
    fetchNodes,
    fetchSubtree,
    createNode,
    updateNode,
    deleteNode,
    fetchRBTEntries,
    saveRBTEntry,
  };
};