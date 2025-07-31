import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FeedbackSpace {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  location_name?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  unique_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFeedbackSpaces = () => {
  const { user } = useAuth();
  const [feedbackSpaces, setFeedbackSpaces] = useState<FeedbackSpace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbackSpaces = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('feedback_spaces')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback spaces:', error);
        toast.error('Failed to fetch feedback spaces');
        return;
      }

      setFeedbackSpaces(data || []);
    } catch (error) {
      console.error('Error fetching feedback spaces:', error);
      toast.error('Failed to fetch feedback spaces');
    } finally {
      setLoading(false);
    }
  };

  const createFeedbackSpace = async (spaceData: {
    title: string;
    description?: string;
    location_name?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a feedback space');
      return null;
    }

    try {
      console.log('Creating feedback space with data:', spaceData);
      
      // Generate unique code
      console.log('Calling generate_unique_code RPC...');
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_unique_code');

      console.log('RPC response:', { codeData, codeError });

      if (codeError) {
        console.error('Error generating unique code:', codeError);
        toast.error('Failed to generate unique code');
        return null;
      }

      console.log('Creating feedback space with code:', codeData);
      const { data, error } = await supabase
        .from('feedback_spaces')
        .insert({
          ...spaceData,
          owner_id: user.id,
          unique_code: codeData
        })
        .select()
        .single();

      console.log('Insert response:', { data, error });

      if (error) {
        console.error('Error creating feedback space:', error);
        toast.error('Failed to create feedback space');
        return null;
      }

      toast.success('Feedback space created successfully!');
      await fetchFeedbackSpaces();
      return data;
    } catch (error) {
      console.error('Error creating feedback space:', error);
      toast.error('Failed to create feedback space');
      return null;
    }
  };

  const updateFeedbackSpace = async (id: string, updates: Partial<FeedbackSpace>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('feedback_spaces')
        .update(updates)
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error updating feedback space:', error);
        toast.error('Failed to update feedback space');
        return false;
      }

      toast.success('Feedback space updated successfully!');
      await fetchFeedbackSpaces();
      return true;
    } catch (error) {
      console.error('Error updating feedback space:', error);
      toast.error('Failed to update feedback space');
      return false;
    }
  };

  const deleteFeedbackSpace = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('feedback_spaces')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) {
        console.error('Error deleting feedback space:', error);
        toast.error('Failed to delete feedback space');
        return false;
      }

      toast.success('Feedback space deleted successfully!');
      await fetchFeedbackSpaces();
      return true;
    } catch (error) {
      console.error('Error deleting feedback space:', error);
      toast.error('Failed to delete feedback space');
      return false;
    }
  };

  const getFeedbackSpaceByCode = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('feedback_spaces')
        .select('*')
        .eq('unique_code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching feedback space by code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching feedback space by code:', error);
      return null;
    }
  };

  const getFeedbackSpaceRetros = async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('retrospectives')
        .select(`
          *,
          user_profiles!inner(display_name, avatar_url)
        `)
        .eq('feedback_space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback space retros:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feedback space retros:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchFeedbackSpaces();
  }, [user]);

  return {
    feedbackSpaces,
    loading,
    createFeedbackSpace,
    updateFeedbackSpace,
    deleteFeedbackSpace,
    getFeedbackSpaceByCode,
    getFeedbackSpaceRetros,
    refreshFeedbackSpaces: fetchFeedbackSpaces
  };
};