import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { UserProfile } from '@/lib/supabase';

export interface TripPlannerMember {
  id: string;
  trip_planner_id: string;
  user_id: string;
  invited_by_user_id: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  user_profiles: UserProfile;
  invited_by_user: UserProfile;
  trip_planner_title?: string;
}

export function useTripPlannerMembers(tripPlannerId?: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TripPlannerMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TripPlannerMember[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    if (!tripPlannerId || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_planner_members')
        .select(`
          *,
          user_profiles!trip_planner_members_user_id_fkey(id, email, display_name, avatar_url),
          invited_by_user:user_profiles!trip_planner_members_invited_by_user_id_fkey(id, email, display_name, avatar_url)
        `)
        .eq('trip_planner_id', tripPlannerId)
        .eq('status', 'accepted');

      if (error) throw error;
      setMembers((data || []) as TripPlannerMember[]);
    } catch (error) {
      console.error('Error fetching trip planner members:', error);
      toast.error('Failed to load trip planner members');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trip_planner_members')
        .select(`
          *,
          trip_planners!inner(title),
          invited_by_user:user_profiles!trip_planner_members_invited_by_user_id_fkey(id, email, display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      const invitations = (data || []).map(invitation => ({
        ...invitation,
        trip_planner_title: invitation.trip_planners?.title,
        user_profiles: {} as UserProfile, // Not needed for invitations
        status: invitation.status as 'pending' | 'accepted' | 'declined'
      }));
      
      setPendingInvitations(invitations as TripPlannerMember[]);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const inviteUser = async (userEmail: string) => {
    if (!user || !tripPlannerId) return;

    try {
      // Check if user exists and get their profile
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (userError || !userProfile) {
        toast.error('User not found. They need to sign up first.');
        return;
      }

      // Check if users are friends
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userProfile.id}),and(user_id.eq.${userProfile.id},friend_id.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle();

      if (friendshipError) {
        console.error('Error checking friendship:', friendshipError);
      }

      if (!friendship) {
        toast.error('You can only invite friends to your trip planners.');
        return;
      }

      // Check if user is already a member or has pending invitation
      const { data: existingMember, error: memberError } = await supabase
        .from('trip_planner_members')
        .select('*')
        .eq('trip_planner_id', tripPlannerId)
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (memberError) {
        console.error('Error checking existing membership:', memberError);
        toast.error('Failed to check membership status');
        return;
      }

      if (existingMember) {
        if (existingMember.status === 'pending') {
          toast.error('User already has a pending invitation');
        } else if (existingMember.status === 'accepted') {
          toast.error('User is already a member of this trip planner');
        }
        return;
      }

      // Send invitation
      const { error: inviteError } = await supabase
        .from('trip_planner_members')
        .insert({
          trip_planner_id: tripPlannerId,
          user_id: userProfile.id,
          invited_by_user_id: user.id,
          role: 'member',
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast.success(`Invitation sent to ${userProfile.display_name}`);
      await fetchMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
    }
  };

  const inviteUserById = async (userId: string) => {
    if (!user || !tripPlannerId) return;

    try {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        toast.error('User not found');
        return;
      }

      // Check if user is already a member or has pending invitation
      const { data: existingMember, error: memberError } = await supabase
        .from('trip_planner_members')
        .select('*')
        .eq('trip_planner_id', tripPlannerId)
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error checking existing membership:', memberError);
        toast.error('Failed to check membership status');
        return;
      }

      if (existingMember) {
        if (existingMember.status === 'pending') {
          toast.error('User already has a pending invitation');
        } else if (existingMember.status === 'accepted') {
          toast.error('User is already a member of this trip planner');
        }
        return;
      }

      // Send invitation
      const { error: inviteError } = await supabase
        .from('trip_planner_members')
        .insert({
          trip_planner_id: tripPlannerId,
          user_id: userId,
          invited_by_user_id: user.id,
          role: 'member',
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast.success(`Invitation sent to ${userProfile.display_name}`);
      await fetchMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
    }
  };

  const respondToInvitation = async (memberId: string, status: 'accepted' | 'declined') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trip_planner_members')
        .update({ status })
        .eq('id', memberId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(status === 'accepted' ? 'Invitation accepted!' : 'Invitation declined');
      await fetchPendingInvitations();
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trip_planner_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member removed from trip planner');
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  useEffect(() => {
    if (tripPlannerId) {
      fetchMembers();
    }
  }, [tripPlannerId, user]);

  useEffect(() => {
    fetchPendingInvitations();

    // Set up real-time subscription for invitation updates
    const channel = supabase
      .channel('trip_planner_invitations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_planner_members',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchPendingInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    members,
    pendingInvitations,
    loading,
    inviteUser,
    inviteUserById,
    respondToInvitation,
    removeMember,
    fetchMembers,
    fetchPendingInvitations
  };
}