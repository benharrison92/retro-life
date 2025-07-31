import { useState, useEffect } from 'react';
import { supabase, Retrospective, RBTItem } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}

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
    feedback_space_id: dbRetro.feedback_space_id || undefined,
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
    feedback_space_id: appRetro.feedback_space_id,
  });

  // Fetch retros (own + friends') with attendee users
  const fetchRetros = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First fetch retros
      const { data: retrosData, error: retrosError } = await supabase
        .from('retrospectives')
        .select('*')
        .order('date', { ascending: false });

      if (retrosError) throw retrosError;

      // Then fetch attendees for each retro
      const retrosWithAttendees = await Promise.all(
        (retrosData || []).map(async (retro) => {
          const convertedRetro = convertDbToApp(retro);
          
          console.log('fetchRetros: Processing retro', retro.id, retro.title);
          
          // Fetch attendee users for this retro
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('retro_attendees')
            .select(`
              user_profiles (
                id,
                email,
                display_name,
                avatar_url
              )
            `)
            .eq('retro_id', retro.id);

          console.log('fetchRetros: Attendees query result for retro', retro.id, {
            attendeesData,
            attendeesError
          });

          if (!attendeesError && attendeesData) {
            convertedRetro.attendeeUsers = attendeesData
              .map((attendee: any) => attendee.user_profiles)
              .filter(Boolean);
            console.log('fetchRetros: Set attendeeUsers for retro', retro.id, convertedRetro.attendeeUsers);
          } else {
            convertedRetro.attendeeUsers = [];
            console.log('fetchRetros: No attendees found for retro', retro.id);
          }

          return convertedRetro;
        })
      );

      console.log('fetchRetros: Final retros with attendees:', retrosWithAttendees);
      setRetros(retrosWithAttendees);
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

  // Manage retro attendees
  const addAttendees = async (retroId: string, attendeeUsers: UserProfile[]) => {
    if (!user) return;

    try {
      console.log('addAttendees: Adding attendees to retro', retroId, attendeeUsers);
      
      // Insert attendees into retro_attendees table
      const attendeeInserts = attendeeUsers.map(attendee => ({
        retro_id: retroId,
        user_id: attendee.id,
      }));

      console.log('addAttendees: Inserting attendee data:', attendeeInserts);

      const { error } = await supabase
        .from('retro_attendees')
        .insert(attendeeInserts);

      if (error) {
        console.error('addAttendees: Error inserting attendees:', error);
        throw error;
      }

      console.log('addAttendees: Successfully added attendees');
      toast({
        title: "Success",
        description: "Attendees added successfully",
      });
    } catch (error) {
      console.error('Error adding attendees:', error);
      toast({
        title: "Error",
        description: "Failed to add attendees",
        variant: "destructive",
      });
    }
  };

  const removeAttendee = async (retroId: string, userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('retro_attendees')
        .delete()
        .eq('retro_id', retroId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendee removed successfully",
      });
    } catch (error) {
      console.error('Error removing attendee:', error);
      toast({
        title: "Error",
        description: "Failed to remove attendee",
        variant: "destructive",
      });
    }
  };

  // Create new retro with attendees
  const createRetro = async (retroData: Omit<Retrospective, 'id' | 'user_id' | 'created_at' | 'updated_at'>, attendeeUsers?: UserProfile[]) => {
    if (!user) return;

    try {
      const dbData = convertAppToDb(retroData);
      console.log('createRetro: Input retroData:', retroData);
      console.log('createRetro: Input attendeeUsers:', attendeeUsers);
      console.log('createRetro: Converted dbData:', dbData);
      
      const insertData = {
        ...dbData,
        user_id: user.id,
      };
      
      console.log('createRetro: Final insertData:', insertData);
      
      const { data, error } = await supabase
        .from('retrospectives')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('createRetro: Error creating retro:', error);
        throw error;
      }
      
      console.log('createRetro: Retro created successfully:', data);
      
      // Add attendees if provided
      if (attendeeUsers && attendeeUsers.length > 0) {
        console.log('createRetro: Adding attendees to retro:', data.id, attendeeUsers);
        await addAttendees(data.id, attendeeUsers);
      } else {
        console.log('createRetro: No attendees to add');
      }
      
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
    addAttendees,
    removeAttendee,
    searchRetrosByLocation,
    refreshRetros: fetchRetros,
  };
};