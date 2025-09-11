import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Retrospective } from '@/lib/supabase';

interface AggregatedRBTItem {
  id: string;
  text: string;
  tags?: string[];
  comments?: any[];
  photos?: any[];
  ownerName?: string;
  place_id?: string;
  place_name?: string;
  place_address?: string;
  place_rating?: number;
  place_types?: string[];
  source?: {
    retroId: string;
    retroTitle: string;
    isChildItem: boolean;
  };
}

interface AggregatedRetro {
  roses: AggregatedRBTItem[];
  buds: AggregatedRBTItem[];
  thorns: AggregatedRBTItem[];
  showChildItems: boolean;
}

export const useAggregatedRetro = (parentRetro: Retrospective | undefined) => {
  const [childRetros, setChildRetros] = useState<any[]>([]);
  const [showChildItems, setShowChildItems] = useState(true);
  const [loading, setLoading] = useState(false);

  // Convert database retro to app format (similar to useRetros)
  const convertDbToApp = (dbRetro: any): Retrospective => ({
    id: dbRetro.id,
    user_id: dbRetro.user_id,
    title: dbRetro.title,
    event_type: dbRetro.event_type,
    date: dbRetro.date,
    attendees: dbRetro.attendees || [],
    roses: dbRetro.roses || [],
    buds: dbRetro.buds || [],
    thorns: dbRetro.thorns || [],
    photos: dbRetro.photos || [],
    primaryPhotoUrl: dbRetro.primary_photo_url,
    location_name: dbRetro.location_name,
    city: dbRetro.city,
    state: dbRetro.state,
    country: dbRetro.country || 'US',
    latitude: dbRetro.latitude || undefined,
    longitude: dbRetro.longitude || undefined,
    parent_id: dbRetro.parent_id || undefined,
    feedback_space_id: dbRetro.feedback_space_id || undefined,
    is_private: dbRetro.is_private || false,
    created_at: dbRetro.created_at || '',
    updated_at: dbRetro.updated_at || '',
    place_id: dbRetro.place_id,
    place_name: dbRetro.place_name,
    place_address: dbRetro.place_address,
    place_rating: dbRetro.place_rating,
    place_user_ratings_total: dbRetro.place_user_ratings_total,
    place_types: dbRetro.place_types,
    place_photos: dbRetro.place_photos,
  });

  // Fetch child retros
  const fetchChildRetros = useCallback(async () => {
    if (!parentRetro?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('parent_id', parentRetro.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching child retros:', error);
        return;
      }

      setChildRetros((data || []).map(convertDbToApp));
    } catch (error) {
      console.error('Error fetching child retros:', error);
    } finally {
      setLoading(false);
    }
  }, [parentRetro?.id]);

  useEffect(() => {
    fetchChildRetros();
  }, [fetchChildRetros]);

  // Create aggregated retro with child items
  const aggregatedRetro = useMemo((): AggregatedRetro => {
    if (!parentRetro) {
      return { roses: [], buds: [], thorns: [], showChildItems };
    }

    // Helper function to add source info to RBT items
    const addSourceInfo = (items: any[], retroId: string, retroTitle: string, isChildItem: boolean): AggregatedRBTItem[] => {
      return (items || []).map(item => ({
        ...item,
        source: {
          retroId,
          retroTitle,
          isChildItem
        }
      }));
    };

    // Start with parent items
    let allRoses = addSourceInfo(parentRetro.roses || [], parentRetro.id, parentRetro.title, false);
    let allBuds = addSourceInfo(parentRetro.buds || [], parentRetro.id, parentRetro.title, false);
    let allThorns = addSourceInfo(parentRetro.thorns || [], parentRetro.id, parentRetro.title, false);

    // Add child items if they should be shown
    if (showChildItems) {
      childRetros.forEach(childRetro => {
        allRoses = [
          ...allRoses,
          ...addSourceInfo(childRetro.roses || [], childRetro.id, childRetro.title, true)
        ];
        allBuds = [
          ...allBuds,
          ...addSourceInfo(childRetro.buds || [], childRetro.id, childRetro.title, true)
        ];
        allThorns = [
          ...allThorns,
          ...addSourceInfo(childRetro.thorns || [], childRetro.id, childRetro.title, true)
        ];
      });
    }

    return {
      roses: allRoses,
      buds: allBuds,
      thorns: allThorns,
      showChildItems
    };
  }, [parentRetro, childRetros, showChildItems]);

  const toggleChildItems = () => {
    setShowChildItems(prev => !prev);
  };

  const childItemsCount = useMemo(() => {
    return childRetros.reduce((total, child) => {
      return total + (child.roses?.length || 0) + (child.buds?.length || 0) + (child.thorns?.length || 0);
    }, 0);
  }, [childRetros]);

  return {
    aggregatedRetro,
    childRetros,
    childItemsCount,
    showChildItems,
    toggleChildItems,
    loading,
    refreshChildRetros: fetchChildRetros,
  };
};