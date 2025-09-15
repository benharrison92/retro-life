import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  target_id?: string;
  target_type?: string;
  data: any;
  created_at: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchActivities = async (offset = 0, replace = true) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + 19);

      if (error) throw error;

      // Fetch user profiles separately
      const activitiesWithProfiles = await Promise.all(
        (data || []).map(async (activity) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('id', activity.user_id)
            .single();

          return {
            ...activity,
            user_profiles: profile || undefined,
          };
        })
      );

      if (replace) {
        setActivities(activitiesWithProfiles);
      } else {
        setActivities(prev => [...prev, ...activitiesWithProfiles]);
      }
      
      setHasMore(activitiesWithProfiles.length === 20);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchActivities(activities.length, false);
  };

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription for new activities
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    activities,
    loading,
    hasMore,
    loadMore,
    refetch: () => fetchActivities()
  };
};