import { useState, useEffect } from 'react';
import { supabase, Retrospective, RBTItem } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type DbRetrospective = Database['public']['Tables']['retrospectives']['Row'];
type DbRetrospectiveInsert = Database['public']['Tables']['retrospectives']['Insert'];

export const useRetros = () => {
  const [retros, setRetros] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Convert DB row to app type
  const convertDbToApp = (dbRetro: DbRetrospective): Retrospective => ({
    id: dbRetro.id,
    user_id: dbRetro.user_id,
    title: dbRetro.title,
    event_type: dbRetro.event_type,
    date: dbRetro.date,
    attendees: dbRetro.attendees || [],
    roses: (dbRetro.roses as unknown as RBTItem[]) || [],
    buds: (dbRetro.buds as unknown as RBTItem[]) || [],
    thorns: (dbRetro.thorns as unknown as RBTItem[]) || [],
    photos: (dbRetro.photos as any) || [],
    location_name: dbRetro.location_name || undefined,
    city: dbRetro.city || undefined,
    state: dbRetro.state || undefined,
    country: dbRetro.country || undefined,
    latitude: dbRetro.latitude || undefined,
    longitude: dbRetro.longitude || undefined,
    created_at: dbRetro.created_at || '',
    updated_at: dbRetro.updated_at || '',
  });

  // Convert app type to DB insert
  const convertAppToDb = (appRetro: Omit<Retrospective, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Omit<DbRetrospectiveInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
    title: appRetro.title,
    event_type: appRetro.event_type,
    date: appRetro.date,
    attendees: appRetro.attendees,
    roses: appRetro.roses as any,
    buds: appRetro.buds as any,
    thorns: appRetro.thorns as any,
    photos: appRetro.photos as any,
    location_name: appRetro.location_name,
    city: appRetro.city,
    state: appRetro.state,
    country: appRetro.country,
    latitude: appRetro.latitude,
    longitude: appRetro.longitude,
  });

  // Fetch retros (own + friends')
  const fetchRetros = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('retrospectives')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRetros((data || []).map(convertDbToApp));
    } catch (error) {
      console.error('Error fetching retros:', error);
      toast({
        title: "Error",
        description: "Failed to load retrospectives",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new retro
  const createRetro = async (retroData: Omit<Retrospective, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const dbData = convertAppToDb(retroData);
      const { data, error } = await supabase
        .from('retrospectives')
        .insert([{
          ...dbData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      
      const convertedData = convertDbToApp(data);
      setRetros(prev => [convertedData, ...prev]);
      toast({
        title: "Success",
        description: "Retrospective created successfully",
      });
      
      return convertedData;
    } catch (error) {
      console.error('Error creating retro:', error);
      toast({
        title: "Error",
        description: "Failed to create retrospective",
        variant: "destructive",
      });
    }
  };

  // Update retro
  const updateRetro = async (id: string, updates: Partial<Retrospective>) => {
    try {
      const dbUpdates: any = {};
      
      // Convert only the fields that need updating
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.event_type !== undefined) dbUpdates.event_type = updates.event_type;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.attendees !== undefined) dbUpdates.attendees = updates.attendees;
      if (updates.roses !== undefined) dbUpdates.roses = updates.roses;
      if (updates.buds !== undefined) dbUpdates.buds = updates.buds;
      if (updates.thorns !== undefined) dbUpdates.thorns = updates.thorns;
      if (updates.photos !== undefined) dbUpdates.photos = updates.photos;
      if (updates.location_name !== undefined) dbUpdates.location_name = updates.location_name;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;

      const { data, error } = await supabase
        .from('retrospectives')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const convertedData = convertDbToApp(data);
      setRetros(prev => prev.map(retro => 
        retro.id === id ? convertedData : retro
      ));
      
      toast({
        title: "Success",
        description: "Retrospective updated successfully",
      });
      
      return convertedData;
    } catch (error) {
      console.error('Error updating retro:', error);
      toast({
        title: "Error",
        description: "Failed to update retrospective",
        variant: "destructive",
      });
    }
  };

  // Delete retro
  const deleteRetro = async (id: string) => {
    try {
      const { error } = await supabase
        .from('retrospectives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRetros(prev => prev.filter(retro => retro.id !== id));
      toast({
        title: "Success",
        description: "Retrospective deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting retro:', error);
      toast({
        title: "Error",
        description: "Failed to delete retrospective",
        variant: "destructive",
      });
    }
  };

  // Search retros by location
  const searchRetrosByLocation = async (city?: string, state?: string, radius?: number) => {
    if (!user) return [];

    try {
      let query = supabase.from('retrospectives').select('*');
      
      if (city && state) {
        query = query.or(`city.ilike.%${city}%,state.ilike.%${state}%`);
      } else if (city) {
        query = query.ilike('city', `%${city}%`);
      } else if (state) {
        query = query.ilike('state', `%${state}%`);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;
      return (data || []).map(convertDbToApp);
    } catch (error) {
      console.error('Error searching retros by location:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchRetros();
  }, [user]);

  return {
    retros,
    loading,
    createRetro,
    updateRetro,
    deleteRetro,
    searchRetrosByLocation,
    refreshRetros: fetchRetros,
  };
};