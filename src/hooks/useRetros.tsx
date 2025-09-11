import { useState, useEffect, useCallback } from 'react';
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
    primaryPhotoUrl: (dbRetro as any).primary_photo_url || undefined,
    location_name: dbRetro.location_name || undefined,
    city: dbRetro.city || undefined,
    state: dbRetro.state || undefined,
    country: dbRetro.country || undefined,
    latitude: dbRetro.latitude || undefined,
    longitude: dbRetro.longitude || undefined,
    feedback_space_id: dbRetro.feedback_space_id || undefined,
    is_private: (dbRetro as any).is_private || false, // Default to public for backward compatibility
    created_at: dbRetro.created_at || '',
    updated_at: dbRetro.updated_at || '',
  });

  // Convert app type to DB insert
  const convertAppToDb = (appRetro: Omit<Retrospective, 'id' | 'user_id' | 'created_at' | 'updated_at'>): any => ({
    title: appRetro.title,
    event_type: appRetro.event_type,
    date: appRetro.date,
    attendees: appRetro.attendees,
    roses: appRetro.roses as any,
    buds: appRetro.buds as any,
    thorns: appRetro.thorns as any,
    photos: appRetro.photos as any,
    primary_photo_url: appRetro.primaryPhotoUrl,
    location_name: appRetro.location_name,
    city: appRetro.city,
    state: appRetro.state,
    country: appRetro.country,
    latitude: appRetro.latitude,
    longitude: appRetro.longitude,
    parent_id: appRetro.parent_id,
    feedback_space_id: appRetro.feedback_space_id,
    is_private: appRetro.is_private,
    // Google Places data
    place_id: appRetro.place_id,
    place_name: appRetro.place_name,
    place_address: appRetro.place_address,
    place_rating: appRetro.place_rating,
    place_user_ratings_total: appRetro.place_user_ratings_total,
    place_types: appRetro.place_types,
    place_photos: appRetro.place_photos as any,
  });

  // Fetch retros (own + friends') with attendee users
  const fetchRetros = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First fetch retros with feedback space information and owner profile
      const { data: retrosData, error: retrosError } = await supabase
        .from('retrospectives')
        .select(`
          *,
          feedback_spaces(title),
          user_profiles!user_id(display_name)
        `)
        .order('date', { ascending: false });

      if (retrosError) throw retrosError;

      // Then fetch attendees for each retro and add feedback space info
      const retrosWithAttendees = await Promise.all(
        (retrosData || []).map(async (retro: any) => {
          const convertedRetro = convertDbToApp(retro);
          
          // Add owner name from user profile
          if (retro.user_profiles) {
            convertedRetro.ownerName = retro.user_profiles.display_name;
          }
          
          // Add feedback space information
          if (retro.feedback_spaces) {
            convertedRetro.feedbackSpaceName = retro.feedback_spaces.title;
          }
          
          console.log('fetchRetros: Processing retro', retro.id, retro.title);
          
          // Fetch attendee users for this retro
          console.log('fetchRetros: Fetching attendees for retro', retro.id, retro.title);
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('retro_attendees')
            .select(`
              user_profiles!inner (
                id,
                email,
                display_name,
                avatar_url
              )
            `)
            .eq('retro_id', retro.id);

          console.log('🔍 fetchRetros: RAW ATTENDEES QUERY RESULT for retro', retro.title, {
            attendeesData,
            attendeesError,
            retroId: retro.id
          });

          if (!attendeesError && attendeesData) {
            const mappedAttendees = attendeesData
              .map((attendee: any) => attendee.user_profiles)
              .filter(Boolean);
            
            console.log('🔍 fetchRetros: MAPPED ATTENDEES for retro', retro.title, {
              mappedAttendees,
              attendeesDataLength: attendeesData.length,
              mappedLength: mappedAttendees.length
            });
            
            convertedRetro.attendeeUsers = mappedAttendees;
            console.log('🔍 fetchRetros: FINAL attendeeUsers set for retro', retro.title, convertedRetro.attendeeUsers);
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
  }, [user, toast]);

  // Fetch only parent retros (for main homepage display)
  const fetchParentRetros = useCallback(async () => {
    if (!user) return [];

    try {
      const { data: retrosData, error: retrosError } = await supabase
        .from('retrospectives')
        .select(`
          *,
          feedback_spaces(title),
          user_profiles!user_id(display_name)
        `)
        .is('parent_id', null)
        .eq('is_private', false)
        .order('date', { ascending: false });

      if (retrosError) throw retrosError;

      // Process parent retros with attendees
      const parentRetrosWithAttendees = await Promise.all(
        (retrosData || []).map(async (retro: any) => {
          const convertedRetro = convertDbToApp(retro);
          
          // Add owner name from user profile
          if (retro.user_profiles) {
            convertedRetro.ownerName = retro.user_profiles.display_name;
          }
          
          // Add feedback space information
          if (retro.feedback_spaces) {
            convertedRetro.feedbackSpaceName = retro.feedback_spaces.title;
          }
          
          // Fetch attendee users for this retro
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('retro_attendees')
            .select(`
              user_profiles!inner (
                id,
                email,
                display_name,
                avatar_url
              )
            `)
            .eq('retro_id', retro.id);

          if (!attendeesError && attendeesData) {
            convertedRetro.attendeeUsers = attendeesData
              .map((attendee: any) => attendee.user_profiles)
              .filter(Boolean);
          } else {
            convertedRetro.attendeeUsers = [];
          }

          return convertedRetro;
        })
      );

      return parentRetrosWithAttendees;
    } catch (error) {
      console.error('Error fetching parent retros:', error);
      return [];
    }
  }, [user]);

  // Fetch child retros for a specific parent
  const fetchChildRetros = useCallback(async (parentId: string) => {
    if (!user) return [];

    try {
      const { data: retrosData, error: retrosError } = await supabase
        .from('retrospectives')
        .select(`
          *,
          feedback_spaces(title),
          user_profiles!user_id(display_name)
        `)
        .eq('parent_id', parentId)
        .order('date', { ascending: false });

      if (retrosError) throw retrosError;

      // Process child retros with attendees
      const childRetrosWithAttendees = await Promise.all(
        (retrosData || []).map(async (retro: any) => {
          const convertedRetro = convertDbToApp(retro);
          
          // Add owner name from user profile
          if (retro.user_profiles) {
            convertedRetro.ownerName = retro.user_profiles.display_name;
          }
          
          // Add feedback space information
          if (retro.feedback_spaces) {
            convertedRetro.feedbackSpaceName = retro.feedback_spaces.title;
          }
          
          // Fetch attendee users for this retro
          const { data: attendeesData, error: attendeesError } = await supabase
            .from('retro_attendees')
            .select(`
              user_profiles!inner (
                id,
                email,
                display_name,
                avatar_url
              )
            `)
            .eq('retro_id', retro.id);

          if (!attendeesError && attendeesData) {
            convertedRetro.attendeeUsers = attendeesData
              .map((attendee: any) => attendee.user_profiles)
              .filter(Boolean);
          } else {
            convertedRetro.attendeeUsers = [];
          }

          return convertedRetro;
        })
      );

      return childRetrosWithAttendees.filter(r => !r.is_private);
    } catch (error) {
      console.error('Error fetching child retros:', error);
      return [];
    }
  }, [user]);

  // Manage retro attendees
  const addAttendees = async (retroId: string, attendeeUsers: UserProfile[]) => {
    if (!user) {
      console.error('🚨 addAttendees: No authenticated user');
      return;
    }

    try {
      console.log('🚀 addAttendees: Starting to add attendees to retro', retroId, attendeeUsers);
      
      // Check if user has permission to add attendees to this retro
      const { data: retroData, error: retroError } = await supabase
        .from('retrospectives')
        .select('user_id, title')
        .eq('id', retroId)
        .single();

      if (retroError) {
        console.error('🚨 addAttendees: Error fetching retro:', retroError);
        throw retroError;
      }

      console.log('🚀 addAttendees: Retro data:', retroData);
      console.log('🚀 addAttendees: Current user ID:', user.id);
      console.log('🚀 addAttendees: Retro owner ID:', retroData.user_id);
      
      // Insert attendees into retro_attendees table
      const attendeeInserts = attendeeUsers.map(attendee => ({
        retro_id: retroId,
        user_id: attendee.id,
      }));

      console.log('🚀 addAttendees: Inserting attendee data:', attendeeInserts);

      for (const attendeeInsert of attendeeInserts) {
        console.log('🚀 addAttendees: Inserting individual attendee:', attendeeInsert);
        
        const { data: insertResult, error: insertError } = await supabase
          .from('retro_attendees')
          .insert([attendeeInsert])
          .select();

        if (insertError) {
          console.error('🚨 addAttendees: Error inserting attendee:', insertError);
          console.error('🚨 addAttendees: Failed attendee data:', attendeeInsert);
          
          // Log the specific error for debugging
          if (insertError.code === '23505') {
            console.log('ℹ️ addAttendees: Duplicate attendee detected (user already added)');
          }
          
          // Continue with other attendees but log the error
          toast({
            title: "Warning",
            description: `Failed to add attendee: ${attendeeUsers.find(u => u.id === attendeeInsert.user_id)?.display_name}`,
            variant: "destructive",
          });
        } else {
          console.log('✅ addAttendees: Successfully inserted attendee:', insertResult);
        }
      }

      console.log('✅ addAttendees: Finished processing all attendees');
      
      // Verify what was actually saved to the database
      const { data: verifyData, error: verifyError } = await supabase
        .from('retro_attendees')
        .select(`
          user_id,
          user_profiles!inner (
            id,
            display_name,
            email
          )
        `)
        .eq('retro_id', retroId);
        
      console.log('🔍 addAttendees: VERIFICATION - Final attendees in DB:', verifyData);
      if (verifyError) {
        console.error('🚨 addAttendees: Verification error:', verifyError);
      }
      
      toast({
        title: "Success",
        description: "Attendees processed",
      });
    } catch (error) {
      console.error('🚨 Error adding attendees:', error);
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

  // Update retro with attendees
  const updateRetro = async (id: string, updates: Partial<Retrospective>, attendeeUsers?: UserProfile[]) => {
    try {
      console.log('updateRetro: Starting update for retro:', id);
      console.log('updateRetro: Updates:', updates);
      console.log('updateRetro: AttendeeUsers:', attendeeUsers);
      
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
      if (updates.primaryPhotoUrl !== undefined) dbUpdates.primary_photo_url = updates.primaryPhotoUrl;
      if (updates.location_name !== undefined) dbUpdates.location_name = updates.location_name;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.country !== undefined) dbUpdates.country = updates.country;
      if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;

      console.log('updateRetro: DB updates to apply:', dbUpdates);

      // Fetch with user profile to preserve owner name
      const { data, error } = await supabase
        .from('retrospectives')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          user_profiles!user_id(display_name),
          feedback_spaces(title)
        `)
        .single();

      if (error) throw error;

      console.log('updateRetro: Database update result:', data);

      // Handle attendee users if provided
      if (attendeeUsers !== undefined) {
        console.log('updateRetro: Managing attendees for retro:', id);
        
        // Remove existing attendees
        const { error: deleteError } = await supabase
          .from('retro_attendees')
          .delete()
          .eq('retro_id', id);

        if (deleteError) {
          console.error('updateRetro: Error removing existing attendees:', deleteError);
        }

        // Add new attendees
        if (attendeeUsers.length > 0) {
          console.log('updateRetro: Adding new attendees:', attendeeUsers);
          await addAttendees(id, attendeeUsers);
        }
      }

      // Convert and preserve owner/feedback space info
      const convertedData = convertDbToApp(data);
      
      // Add owner name from user profile
      if (data.user_profiles) {
        convertedData.ownerName = data.user_profiles.display_name;
        console.log('updateRetro: Set owner name to:', convertedData.ownerName);
      }
      
      // Add feedback space information
      if (data.feedback_spaces) {
        convertedData.feedbackSpaceName = data.feedback_spaces.title;
      }

      // Fetch and add attendee users
      if (attendeeUsers !== undefined || !convertedData.attendeeUsers) {
        console.log('updateRetro: Fetching attendees for updated retro');
        const { data: attendeesData, error: attendeesError } = await supabase
          .from('retro_attendees')
          .select(`
            user_profiles!inner (
              id,
              email,
              display_name,
              avatar_url
            )
          `)
          .eq('retro_id', id);

        if (!attendeesError && attendeesData) {
          convertedData.attendeeUsers = attendeesData
            .map((attendee: any) => attendee.user_profiles)
            .filter(Boolean);
          console.log('updateRetro: Set attendeeUsers to:', convertedData.attendeeUsers);
        } else {
          convertedData.attendeeUsers = [];
          console.log('updateRetro: No attendees found or error:', attendeesError);
        }
      }

      console.log('updateRetro: Final converted data:', convertedData);
      
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

  // Set up real-time listener for retro_attendees changes
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up real-time listener for retro_attendees');
    
    const channel = supabase
      .channel('retro_attendees_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'retro_attendees'
        },
        (payload) => {
          console.log('🔄 Real-time retro_attendees change:', payload);
          // Refresh retros to get updated attendee data
          fetchRetros();
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [user, fetchRetros]);

  // Function to update local state immediately for optimistic updates
  const updateLocalRetro = (retroId: string, updatedRetro: Retrospective) => {
    setRetros(prevRetros => 
      prevRetros.map(r => r.id === retroId ? updatedRetro : r)
    );
  };

  // Make retro public/featured
  const makeRetroPublic = async (retroId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('retrospectives')
        .update({ is_private: false })
        .eq('id', retroId)
        .eq('user_id', user.id); // Only allow owner to make public

      if (error) throw error;

      // Update local state
      setRetros(prevRetros => 
        prevRetros.map(r => 
          r.id === retroId ? { ...r, is_private: false } as any : r
        )
      );

      toast({
        title: "Success",
        description: "Retrospective is now public and featured",
      });
    } catch (error) {
      console.error('Error making retro public:', error);
      toast({
        title: "Error",
        description: "Failed to make retrospective public",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Assign parent to existing retro
  const assignParentRetro = async (retroId: string, parentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('retrospectives')
        .update({ parent_id: parentId })
        .eq('id', retroId)
        .eq('user_id', user.id); // Only allow owner to reassign

      if (error) throw error;

      // Update local state
      setRetros(prevRetros => 
        prevRetros.map(r => 
          r.id === retroId ? { ...r, parent_id: parentId } as any : r
        )
      );

      toast({
        title: "Success", 
        description: "Retrospective hierarchy updated",
      });
    } catch (error) {
      console.error('Error assigning parent retro:', error);
      toast({
        title: "Error",
        description: "Failed to update retrospective hierarchy",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    retros,
    loading,
    fetchRetros,
    fetchParentRetros,
    fetchChildRetros,
    createRetro,
    updateRetro,
    deleteRetro,
    addAttendees,
    removeAttendee,
    searchRetrosByLocation,
    refreshRetros: fetchRetros,
    updateLocalRetro,
    makeRetroPublic,
    assignParentRetro,
  };
};