import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CatalogueDiscussion {
  id: string;
  catalogue_item_id: string;
  user_id: string;
  message: string;
  tagged_user_ids: string[];
  created_at: string;
  updated_at: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
  tagged_users?: Array<{
    id: string;
    display_name: string;
    avatar_url?: string;
  }>;
}

export const useCatalogueDiscussion = (catalogueItemId: string) => {
  const [discussions, setDiscussions] = useState<CatalogueDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDiscussions = useCallback(async () => {
    if (!catalogueItemId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catalogue_discussions')
        .select('*')
        .eq('catalogue_item_id', catalogueItemId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for each discussion
      const discussionsWithProfiles = await Promise.all(
        (data || []).map(async (discussion: any) => {
          const typedDiscussion: CatalogueDiscussion = {
            id: discussion.id,
            catalogue_item_id: discussion.catalogue_item_id,
            user_id: discussion.user_id,
            message: discussion.message,
            tagged_user_ids: discussion.tagged_user_ids || [],
            created_at: discussion.created_at,
            updated_at: discussion.updated_at,
          };

          // Fetch user profile for the discussion author
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('id', discussion.user_id)
            .single();

          if (userProfile) {
            typedDiscussion.user_profiles = userProfile;
          }

          // Fetch tagged user profiles
          if (discussion.tagged_user_ids && discussion.tagged_user_ids.length > 0) {
            const { data: taggedUsers, error: taggedError } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url')
              .in('id', discussion.tagged_user_ids);

            if (!taggedError && taggedUsers) {
              typedDiscussion.tagged_users = taggedUsers;
            }
          }
          return typedDiscussion;
        })
      );

      setDiscussions(discussionsWithProfiles);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to load discussions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [catalogueItemId, toast]);

  const addDiscussion = async (message: string, taggedUserIds: string[] = []) => {
    if (!user || !message.trim()) return;

    try {
      const { data, error } = await supabase
        .from('catalogue_discussions')
        .insert({
          catalogue_item_id: catalogueItemId,
          user_id: user.id,
          message: message.trim(),
          tagged_user_ids: taggedUserIds,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Fetch user profile for the new discussion
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      // Create properly typed discussion object
      const typedDiscussion: CatalogueDiscussion = {
        id: data.id,
        catalogue_item_id: data.catalogue_item_id,
        user_id: data.user_id,
        message: data.message,
        tagged_user_ids: data.tagged_user_ids || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_profiles: userProfile || undefined,
      };

      // Fetch tagged user profiles
      if (taggedUserIds.length > 0) {
        const { data: taggedUsers, error: taggedError } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', taggedUserIds);

        if (!taggedError && taggedUsers) {
          typedDiscussion.tagged_users = taggedUsers;
        }
      }

      setDiscussions(prev => [...prev, typedDiscussion]);

      // Create notifications for tagged users
      if (taggedUserIds.length > 0) {
        await supabase
          .from('notifications')
          .insert(
            taggedUserIds.map(userId => ({
              user_id: userId,
              type: 'comment_tagged',
              title: 'Tagged in Catalogue Discussion',
              message: `You were tagged in a catalogue discussion`,
              related_user_id: user.id,
            }))
          );
      }

      toast({
        title: "Success",
        description: "Discussion added successfully",
      });
    } catch (error) {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error",
        description: "Failed to add discussion",
        variant: "destructive",
      });
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('catalogue_discussions')
        .delete()
        .eq('id', discussionId);

      if (error) throw error;

      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
      
      toast({
        title: "Success",
        description: "Discussion deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error",
        description: "Failed to delete discussion",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  return {
    discussions,
    loading,
    addDiscussion,
    deleteDiscussion,
    refreshDiscussions: fetchDiscussions,
  };
};