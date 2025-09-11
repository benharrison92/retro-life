import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'retro_tagged' | 'comment_added' | 'friend_request' | 'catalogue_invitation' | 'comment_tagged';
  title: string;
  message: string;
  is_read: boolean;
  related_retro_id?: string;
  related_user_id?: string;
  related_item_id?: string;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data || []) as Notification[]);
      const unread = (data || []).filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      console.log('Fetched notifications:', data?.length, 'unread:', unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log('Marked notification as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
      
      console.log('Marked all notifications as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log('Deleted notification:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Accept friend request from notification
  const acceptFriendRequest = async (notificationId: string, fromUserId: string) => {
    if (!user) return;

    try {
      console.log('Accepting friend request:', { notificationId, fromUserId, currentUserId: user.id });

      // Find the pending friendship record
      const { data: existingFriendship, error: findError } = await supabase
        .from('friendships')
        .select('id')
        .eq('user_id', fromUserId)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .single();

      if (findError) {
        console.error('Error finding friendship:', findError);
        throw new Error('Could not find pending friend request');
      }

      if (!existingFriendship) {
        throw new Error('No pending friend request found');
      }

      // Update the friendship status to accepted
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', existingFriendship.id);

      if (updateError) {
        console.error('Error updating friendship:', updateError);
        throw updateError;
      }

      // Mark the notification as read
      await markAsRead(notificationId);

      toast({
        title: "Friend request accepted!",
        description: "You're now friends!",
      });

      console.log('Friend request accepted successfully');
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  // Decline friend request from notification
  const declineFriendRequest = async (notificationId: string, fromUserId: string) => {
    if (!user) return;

    try {
      console.log('Declining friend request:', { notificationId, fromUserId, currentUserId: user.id });

      // Delete the pending friendship record
      const { error: deleteError } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', fromUserId)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (deleteError) {
        console.error('Error declining friendship:', deleteError);
        throw deleteError;
      }

      // Delete the notification
      await deleteNotification(notificationId);

      toast({
        title: "Friend request declined",
        description: "The friend request has been declined.",
      });

      console.log('Friend request declined successfully');
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline friend request",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up notifications subscription for user:', user.id);
    
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload.new);
          const newNotification = payload.new as Notification;
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    acceptFriendRequest,
    declineFriendRequest,
    refreshNotifications: fetchNotifications,
  };
};