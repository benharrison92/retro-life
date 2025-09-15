import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { RetroComment } from '@/hooks/useRetroInteractions';

interface CommentsSectionProps {
  comments: RetroComment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  loading?: boolean;
}

export function CommentsSection({ 
  comments, 
  onAddComment, 
  onDeleteComment,
  loading = false 
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-4">
      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      )}

      {!user && (
        <div className="text-sm text-neutral-600 text-center py-2">
          Please log in to comment
        </div>
      )}

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="border-t border-neutral-100 pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-start gap-3">
                <img
                  src={comment.user_profiles?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${comment.user_id}`}
                  alt={comment.user_profiles?.display_name || 'User'}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-neutral-900">
                      {comment.user_profiles?.display_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteComment(comment.id)}
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-500 text-center py-4">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
