import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TripPlanner {
  id: string;
  user_id: string;
  catalogue_id?: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TripPlannerItem {
  id: string;
  trip_planner_id: string;
  user_id: string;
  catalogue_item_id?: string;
  title: string;
  description?: string;
  event_type: 'accommodation' | 'travel' | 'activity' | 'food' | 'other';
  status: 'booked' | 'pending_review' | 'declined';
  scheduled_date?: string;
  scheduled_time?: string;
  location_name?: string;
  location_address?: string;
  estimated_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useTripPlanners = () => {
  const [tripPlanners, setTripPlanners] = useState<TripPlanner[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTripPlanners = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_planners')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      setTripPlanners(data || []);
    } catch (error) {
      console.error('Error fetching trip planners:', error);
      toast({
        title: "Error",
        description: "Failed to load trip planners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createTripPlanner = async (
    title: string, 
    description?: string,
    catalogueId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trip_planners')
        .insert({
          user_id: user.id,
          title,
          description,
          catalogue_id: catalogueId,
          start_date: startDate,
          end_date: endDate,
        })
        .select('*')
        .single();

      if (error) throw error;

      setTripPlanners(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Trip planner created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating trip planner:', error);
      toast({
        title: "Error",
        description: "Failed to create trip planner",
        variant: "destructive",
      });
    }
  };

  const updateTripPlanner = async (id: string, updates: Partial<TripPlanner>) => {
    try {
      const { data, error } = await supabase
        .from('trip_planners')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setTripPlanners(prev =>
        prev.map(tp => tp.id === id ? data : tp)
      );

      toast({
        title: "Success",
        description: "Trip planner updated successfully",
      });
    } catch (error) {
      console.error('Error updating trip planner:', error);
      toast({
        title: "Error",
        description: "Failed to update trip planner",
        variant: "destructive",
      });
    }
  };

  const deleteTripPlanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_planners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTripPlanners(prev => prev.filter(tp => tp.id !== id));
      toast({
        title: "Success",
        description: "Trip planner deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trip planner:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip planner",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTripPlanners();
  }, [fetchTripPlanners]);

  return {
    tripPlanners,
    loading,
    createTripPlanner,
    updateTripPlanner,
    deleteTripPlanner,
    refreshTripPlanners: fetchTripPlanners,
  };
};

export const useTripPlannerItems = (tripPlannerId: string) => {
  const [items, setItems] = useState<TripPlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!tripPlannerId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_planner_items')
        .select('*')
        .eq('trip_planner_id', tripPlannerId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching trip planner items:', error);
      toast({
        title: "Error",
        description: "Failed to load trip items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [tripPlannerId, toast]);

  const addItem = async (itemData: Partial<TripPlannerItem> & { title: string }) => {
    if (!user || !itemData.title) return;

    try {
      const { data, error } = await supabase
        .from('trip_planner_items')
        .insert({
          catalogue_item_id: itemData.catalogue_item_id,
          title: itemData.title,
          description: itemData.description,
          event_type: itemData.event_type || 'other',
          status: itemData.status || 'pending_review',
          scheduled_date: itemData.scheduled_date,
          scheduled_time: itemData.scheduled_time,
          location_name: itemData.location_name,
          location_address: itemData.location_address,
          estimated_cost: itemData.estimated_cost,
          notes: itemData.notes,
          trip_planner_id: tripPlannerId,
          user_id: user.id,
        })
        .select('*')
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Item added to trip planner",
      });
      return data;
    } catch (error) {
      console.error('Error adding item to trip planner:', error);
      toast({
        title: "Error",
        description: "Failed to add item to trip planner",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, updates: Partial<TripPlannerItem>) => {
    try {
      const { data, error } = await supabase
        .from('trip_planner_items')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trip_planner_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Item removed from trip planner",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
  };
};