import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RetroLike {
  id: string;
  user_id: string;
  retro_id: string;
  created_at: string;
}

export interface RetroComment {
  id: string;
  user_id: string;
  retro_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface RetroStats {
  likes: number;
  comments: number;
  hasLiked: boolean;
}

export function useRetroInteractions(retroId: string) {
  const { user } = useAuth();
  const [stats, setStats] = useState<RetroStats>({ likes: 0, comments: 0, hasLiked: false });
  const [comments, setComments] = useState<RetroComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch likes and comments
  useEffect(() => {
    if (!retroId) return;
    
    const fetchData = async () => {
      try {
        // Fetch likes
        const { data: likes, error: likesError } = await supabase
          .from('retrospective_likes')
          .select('*')
          .eq('retro_id', retroId);

        if (likesError) throw likesError;

        // Fetch comments with user profiles
        const { data: commentsData, error: commentsError } = await supabase
          .from('retrospective_comments')
          .select(`
            *,
            user_profiles (
              display_name,
              avatar_url
            )
          `)
          .eq('retro_id', retroId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        const hasLiked = user ? likes?.some(like => like.user_id === user.id) : false;
        
        setStats({
          likes: likes?.length || 0,
          comments: commentsData?.length || 0,
          hasLiked
        });

        setComments(commentsData || []);
      } catch (error) {
        console.error('Error fetching retro interactions:', error);
        toast.error('Failed to load interactions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [retroId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please log in to like this retrospective');
      return;
    }

    try {
      if (stats.hasLiked) {
        // Remove like
        const { error } = await supabase
          .from('retrospective_likes')
          .delete()
          .eq('retro_id', retroId)
          .eq('user_id', user.id);

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          likes: prev.likes - 1,
          hasLiked: false
        }));
      } else {
        // Add like
        const { error } = await supabase
          .from('retrospective_likes')
          .insert({
            retro_id: retroId,
            user_id: user.id
          });

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          likes: prev.likes + 1,
          hasLiked: true
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const addComment = async (content: string) => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('retrospective_comments')
        .insert({
          retro_id: retroId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setStats(prev => ({
        ...prev,
        comments: prev.comments + 1
      }));

      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('retrospective_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setStats(prev => ({
        ...prev,
        comments: prev.comments - 1
      }));

      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return {
    stats,
    comments,
    loading,
    toggleLike,
    addComment,
    deleteComment
  };
}