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

interface FeedFilters {
  keywords: string;
  tags: string;
  user: string;
  location: string;
}

export const useFeed = (filters?: FeedFilters) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch user profiles and filter activities
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

      // Apply filters
      let filteredActivities = activitiesWithProfiles;

      if (filters?.location) {
        // For location filtering, fetch retrospective data to check location fields
        const retroActivities = filteredActivities.filter(a => a.target_type === 'retrospective');
        const retroIds = retroActivities.map(a => a.target_id).filter(Boolean);
        
        if (retroIds.length > 0) {
          const { data: retros } = await supabase
            .from('retrospectives')
            .select('id, title, city, state, country, location_name')
            .in('id', retroIds);

          filteredActivities = filteredActivities.filter(activity => {
            if (activity.target_type !== 'retrospective') return true;
            
            const retro = retros?.find(r => r.id === activity.target_id);
            if (!retro) return true;

            const searchTerm = filters.location.toLowerCase();
            return (
              retro.title?.toLowerCase().includes(searchTerm) ||
              retro.city?.toLowerCase().includes(searchTerm) ||
              retro.state?.toLowerCase().includes(searchTerm) ||
              retro.country?.toLowerCase().includes(searchTerm) ||
              retro.location_name?.toLowerCase().includes(searchTerm) ||
              (activity.data as any)?.title?.toLowerCase().includes(searchTerm)
            );
          });
        }
      }

      if (filters?.keywords) {
        const searchTerm = filters.keywords.toLowerCase();
        filteredActivities = filteredActivities.filter(activity =>
          (activity.data as any)?.title?.toLowerCase().includes(searchTerm) ||
          activity.user_profiles?.display_name?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters?.user) {
        const searchTerm = filters.user.toLowerCase();
        filteredActivities = filteredActivities.filter(activity =>
          activity.user_profiles?.display_name?.toLowerCase().includes(searchTerm)
        );
      }

      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
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
  }, [user, filters]);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
};