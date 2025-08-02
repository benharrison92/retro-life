import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, X, UserCheck, Tag } from 'lucide-react';
import { RetroPhoto, PhotoReaction, PhotoComment, UserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { FriendTagger } from './social/FriendTagger';
import { PhotoTagger } from './social/PhotoTagger';

interface PhotoModalProps {
  photo: RetroPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePhoto?: (photoId: string, photo: RetroPhoto) => void;
  readonly?: boolean;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  open,
  onOpenChange,
  onUpdatePhoto,
  readonly = false,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [taggedFriendsInComment, setTaggedFriendsInComment] = useState<UserProfile[]>([]);
  const [showPhotoTagger, setShowPhotoTagger] = useState(false);
  const { user, profile } = useAuth();

  console.log('PhotoModal: Rendering with photo:', photo?.id, 'open:', open);

  if (!photo) {
    console.log('PhotoModal: No photo provided, returning null');
    return null;
  }

  const addReaction = () => {
    if (!user || !profile || readonly || !onUpdatePhoto) return;

    // Check if user already reacted
    const existingReaction = photo.reactions.find(r => r.user_id === user.id);
    if (existingReaction) return;

    const newReaction: PhotoReaction = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: profile.display_name,
      type: 'heart',
      timestamp: new Date().toISOString(),
    };

    onUpdatePhoto(photo.id, {
      ...photo,
      reactions: [...photo.reactions, newReaction],
    });
  };

  const removeReaction = () => {
    if (!user || readonly || !onUpdatePhoto) return;

    onUpdatePhoto(photo.id, {
      ...photo,
      reactions: photo.reactions.filter(r => r.user_id !== user.id),
    });
  };

  const addComment = () => {
    console.log('PhotoModal: addComment called');
    console.log('PhotoModal: user:', user, 'profile:', profile, 'readonly:', readonly, 'onUpdatePhoto:', !!onUpdatePhoto);
    
    if (!user || !profile || readonly || !onUpdatePhoto) {
      console.log('PhotoModal: addComment early return - missing requirements');
      return;
    }

    const commentText = commentInput.trim();
    console.log('PhotoModal: commentText:', commentText);
    if (!commentText) {
      console.log('PhotoModal: addComment early return - no comment text');
      return;
    }

    console.log('PhotoModal: Creating new comment for photo:', photo.id);
    const newComment: PhotoComment = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: profile.display_name,
      text: commentText,
      timestamp: new Date().toISOString(),
      taggedFriends: taggedFriendsInComment.length > 0 ? taggedFriendsInComment : undefined,
    };

    console.log('PhotoModal: New comment created:', newComment);
    console.log('PhotoModal: Current photo comments:', photo.comments);

    const updatedPhoto = {
      ...photo,
      comments: [...photo.comments, newComment],
    };

    console.log('PhotoModal: Updated photo with new comment:', updatedPhoto);
    
    onUpdatePhoto(photo.id, updatedPhoto);
    setCommentInput('');
    setTaggedFriendsInComment([]);
    console.log('PhotoModal: Comment added and input cleared');
  };

  const addPhotoTag = (friend: UserProfile) => {
    if (!onUpdatePhoto) return;
    
    const currentTags = photo.taggedFriends || [];
    if (currentTags.some(tag => tag.id === friend.id)) return; // Already tagged
    
    const updatedPhoto = {
      ...photo,
      taggedFriends: [...currentTags, friend],
    };
    
    onUpdatePhoto(photo.id, updatedPhoto);
    setShowPhotoTagger(false);
  };

  const removePhotoTag = (friendId: string) => {
    if (!onUpdatePhoto) return;
    
    const updatedPhoto = {
      ...photo,
      taggedFriends: (photo.taggedFriends || []).filter(tag => tag.id !== friendId),
    };
    
    onUpdatePhoto(photo.id, updatedPhoto);
  };

  const userHasReacted = (): boolean => {
    return user ? photo.reactions.some(r => r.user_id === user.id) : false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Photo Details</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 h-full">
          {/* Photo */}
          <div className="flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption || 'Retro photo'}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>

          {/* Details and interactions */}
          <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto">
            {photo.caption && (
              <div>
                <h3 className="font-semibold mb-2">Caption</h3>
                <p className="text-muted-foreground">{photo.caption}</p>
              </div>
            )}

            {/* Photo tags */}
            {photo.taggedFriends && photo.taggedFriends.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tagged Friends</h3>
                <div className="flex flex-wrap gap-2">
                  {photo.taggedFriends.map((friend) => (
                    <Badge key={friend.id} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="text-xs">
                          {friend.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {friend.display_name}
                      {!readonly && (
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removePhotoTag(friend.id)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions and interactions */}
            <div className="flex items-center gap-3">
              {!readonly && (
                <>
                  <Button
                    variant={userHasReacted() ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      userHasReacted() 
                        ? removeReaction()
                        : addReaction()
                    }
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${userHasReacted() ? 'fill-current' : ''}`} />
                    {photo.reactions.length}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhotoTagger(!showPhotoTagger)}
                    className="flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    Tag Friend
                  </Button>
                </>
              )}

              <Badge variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {photo.comments.length} comments
              </Badge>
            </div>

            {/* Photo tagger */}
            {showPhotoTagger && !readonly && (
              <PhotoTagger
                onTagFriend={addPhotoTag}
                existingTags={photo.taggedFriends || []}
                className="border rounded p-3 bg-muted/20"
              />
            )}

            {/* Reactions list */}
            {photo.reactions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Liked by</h4>
                <div className="flex flex-wrap gap-1">
                  {photo.reactions.map((reaction) => (
                    <Badge key={reaction.id} variant="secondary" className="text-xs">
                      {reaction.user_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="flex-1">
              <h4 className="font-medium mb-3">Comments</h4>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {photo.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No comments yet</p>
                ) : (
                  photo.comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                      {comment.taggedFriends && comment.taggedFriends.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {comment.taggedFriends.map((friend) => (
                            <Badge key={friend.id} variant="outline" className="text-xs">
                              <Avatar className="w-3 h-3 mr-1">
                                <AvatarFallback className="text-xs">
                                  {friend.display_name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              @{friend.display_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add comment */}
              {!readonly && (
                <div className="space-y-3">
                  <FriendTagger
                    value={commentInput}
                    onChange={setCommentInput}
                    onTaggedFriendsChange={setTaggedFriendsInComment}
                    placeholder="Add a comment... Use @ to tag friends"
                    onSubmit={addComment}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={addComment}
                      disabled={!commentInput.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};