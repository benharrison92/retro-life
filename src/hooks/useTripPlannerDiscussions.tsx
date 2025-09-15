import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TripPlannerDiscussion {
  id: string;
  trip_planner_item_id: string;
  user_id: string;
  message: string;
  tagged_user_ids: string[];
  created_at: string;
  updated_at: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useTripPlannerDiscussions = (tripPlannerItemId?: string) => {
  const [discussions, setDiscussions] = useState<TripPlannerDiscussion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDiscussions = async () => {
    if (!tripPlannerItemId || !user) return;

    try {
      setLoading(true);
      
      // First fetch discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('trip_planner_discussions')
        .select('*')
        .eq('trip_planner_item_id', tripPlannerItemId)
        .order('created_at', { ascending: true });

      if (discussionsError) {
        throw discussionsError;
      }

      // Then fetch user profiles for all unique user IDs
      if (discussionsData && discussionsData.length > 0) {
        const userIds = [...new Set(discussionsData.map(d => d.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('fetchDiscussions: Profile Error:', profilesError);
        }

        // Combine the data
        const discussionsWithProfiles = discussionsData.map(discussion => ({
          ...discussion,
          user_profiles: profilesData?.find(profile => profile.id === discussion.user_id)
        }));

        setDiscussions(discussionsWithProfiles);
      } else {
        setDiscussions([]);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error loading discussions",
        description: "Failed to load discussions for this item.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDiscussion = async (message: string, taggedUserIds: string[] = []) => {
    if (!user || !tripPlannerItemId) return;

    try {
      const { data, error } = await supabase
        .from('trip_planner_discussions')
        .insert({
          trip_planner_item_id: tripPlannerItemId,
          user_id: user.id,
          message,
          tagged_user_ids: taggedUserIds,
        })
        .select('*')
        .single();

      if (error) throw error;

      // Fetch user profile for the new discussion
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const discussionWithProfile = {
        ...data,
        user_profiles: profileData
      };

      setDiscussions(prev => [...prev, discussionWithProfile]);
      toast({
        title: "Discussion added",
        description: "Your message has been posted.",
      });
    } catch (error) {
      console.error('Error adding discussion:', error);
      toast({
        title: "Error posting message",
        description: "Failed to post your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateDiscussion = async (discussionId: string, message: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trip_planner_discussions')
        .update({ message, updated_at: new Date().toISOString() })
        .eq('id', discussionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDiscussions(prev =>
        prev.map(discussion =>
          discussion.id === discussionId
            ? { ...discussion, message, updated_at: new Date().toISOString() }
            : discussion
        )
      );

      toast({
        title: "Discussion updated",
        description: "Your message has been updated.",
      });
    } catch (error) {
      console.error('Error updating discussion:', error);
      toast({
        title: "Error updating message",
        description: "Failed to update your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteDiscussion = async (discussionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trip_planner_discussions')
        .delete()
        .eq('id', discussionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDiscussions(prev => prev.filter(discussion => discussion.id !== discussionId));
      toast({
        title: "Discussion deleted",
        description: "Your message has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      toast({
        title: "Error deleting message",
        description: "Failed to delete your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [tripPlannerItemId, user]);

  return {
    discussions,
    loading,
    addDiscussion,
    updateDiscussion,
    deleteDiscussion,
    refetch: fetchDiscussions,
  };
};