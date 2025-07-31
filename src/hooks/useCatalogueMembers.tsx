import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface CatalogueMember {
  id: string;
  catalogue_id: string;
  user_id: string;
  invited_by_user_id: string;
  role: 'owner' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
  invited_by_profile?: {
    display_name: string;
    email: string;
  };
  catalogue?: {
    name: string;
    description?: string;
  };
}

export const useCatalogueMembers = (catalogueId?: string) => {
  const [members, setMembers] = useState<CatalogueMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<CatalogueMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!catalogueId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('catalogue_members')
        .select(`
          *,
          user_profile:user_id(display_name, email, avatar_url),
          invited_by_profile:invited_by_user_id(display_name, email)
        `)
        .eq('catalogue_id', catalogueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers((data as any) || []);
    } catch (error) {
      console.error('Error fetching catalogue members:', error);
      toast({
        title: "Error",
        description: "Failed to load catalogue members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('catalogue_members')
        .select(`
          *,
          catalogue:catalogues(name, description),
          invited_by_profile:invited_by_user_id(display_name, email)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingInvitations((data as any) || []);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const inviteUser = async (userEmail: string) => {
    if (!catalogueId || !user) return false;
    
    try {
      // First, find the user by email
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) {
        toast({
          title: "Error",
          description: "User not found with that email address",
          variant: "destructive",
        });
        return false;
      }

      // Check if user is already a member or has pending invitation
      const { data: existingMember } = await supabase
        .from('catalogue_members')
        .select('id, status')
        .eq('catalogue_id', catalogueId)
        .eq('user_id', userProfile.id)
        .single();

      if (existingMember) {
        toast({
          title: "Error",
          description: existingMember.status === 'pending' 
            ? "User already has a pending invitation" 
            : "User is already a member of this catalogue",
          variant: "destructive",
        });
        return false;
      }

      // Create the invitation
      const { error: inviteError } = await supabase
        .from('catalogue_members')
        .insert({
          catalogue_id: catalogueId,
          user_id: userProfile.id,
          invited_by_user_id: user.id,
          role: 'member',
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      await fetchMembers();
      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  const respondToInvitation = async (memberId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('catalogue_members')
        .update({ status })
        .eq('id', memberId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation ${status}`,
      });

      await fetchPendingInvitations();
      return true;
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('catalogue_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      await fetchMembers();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (catalogueId) {
      fetchMembers();
    }
  }, [catalogueId]);

  useEffect(() => {
    fetchPendingInvitations();
    
    // Set up real-time subscription for pending invitations
    if (user) {
      const channel = supabase
        .channel('catalogue-invitations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'catalogue_members',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchPendingInvitations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    members,
    pendingInvitations,
    loading,
    inviteUser,
    respondToInvitation,
    removeMember,
    refreshMembers: fetchMembers,
    refreshPendingInvitations: fetchPendingInvitations,
  };
};