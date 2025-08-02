import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, X } from 'lucide-react';
import { RetroPhoto, PhotoReaction, PhotoComment } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { PhotoModal } from './PhotoModal';

interface PhotoDisplayProps {
  photos: RetroPhoto[];
  onUpdatePhoto?: (photoId: string, photo: RetroPhoto) => void;
  readonly?: boolean;
  showAsGrid?: boolean;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({
  photos,
  onUpdatePhoto,
  readonly = false,
  showAsGrid = true,
}) => {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<RetroPhoto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user, profile } = useAuth();

  const addReaction = (photoId: string) => {
    if (!user || !profile || readonly || !onUpdatePhoto) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

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

    onUpdatePhoto(photoId, {
      ...photo,
      reactions: [...photo.reactions, newReaction],
    });
  };

  const removeReaction = (photoId: string) => {
    if (!user || readonly || !onUpdatePhoto) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    onUpdatePhoto(photoId, {
      ...photo,
      reactions: photo.reactions.filter(r => r.user_id !== user.id),
    });
  };

  const addComment = (photoId: string) => {
    if (!user || !profile || readonly || !onUpdatePhoto) return;

    const commentText = commentInputs[photoId]?.trim();
    if (!commentText) return;

    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    const newComment: PhotoComment = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: profile.display_name,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    onUpdatePhoto(photoId, {
      ...photo,
      comments: [...photo.comments, newComment],
    });

    setCommentInputs(prev => ({ ...prev, [photoId]: '' }));
  };

  const userHasReacted = (photo: RetroPhoto): boolean => {
    return user ? photo.reactions.some(r => r.user_id === user.id) : false;
  };

  const toggleComments = (photoId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [photoId]: !prev[photoId],
    }));
  };

  const openPhotoModal = (photo: RetroPhoto) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  if (photos.length === 0) {
    return null;
  }

  // If showing as grid (for cards), limit to 3 photos
  const displayPhotos = showAsGrid ? photos.slice(0, 3) : photos;

  return (
    <div className={showAsGrid ? "grid grid-cols-3 gap-2" : "space-y-4"}>
      {displayPhotos.map((photo, index) => (
        <div key={photo.id} className={showAsGrid ? "relative" : ""}>
          {showAsGrid ? (
            // Grid view for RetroCard
            <div className="relative group">
              <img
                src={photo.url}
                alt={photo.caption || 'Retro photo'}
                className="w-full h-24 object-cover rounded cursor-pointer"
                onClick={() => openPhotoModal(photo)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded" />
              <div className="absolute top-1 right-1 flex gap-1">
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <Heart className="w-3 h-3 mr-1" />
                  {photo.reactions.length}
                </Badge>
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {photo.comments.length}
                </Badge>
              </div>
              {photos.length > 3 && index === 2 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                  <span className="text-white font-semibold">+{photos.length - 3}</span>
                </div>
              )}
            </div>
          ) : (
            // Full view
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Retro photo'}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => openPhotoModal(photo)}
                />
              </div>
              
              <CardContent className="p-4 space-y-3">
                {photo.caption && (
                  <p className="text-sm text-muted-foreground">{photo.caption}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!readonly && (
                      <Button
                        variant={userHasReacted(photo) ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          userHasReacted(photo) 
                            ? removeReaction(photo.id)
                            : addReaction(photo.id)
                        }
                        className="flex items-center gap-1"
                      >
                        <Heart className={`w-4 h-4 ${userHasReacted(photo) ? 'fill-current' : ''}`} />
                        {photo.reactions.length}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleComments(photo.id)}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {photo.comments.length}
                    </Button>
                  </div>
                </div>

                {expandedComments[photo.id] && (
                  <>
                    {photo.comments.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {photo.comments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-medium">{comment.user_name}: </span>
                            <span className="text-muted-foreground">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!readonly && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={commentInputs[photo.id] || ''}
                          onChange={(e) => 
                            setCommentInputs(prev => ({ 
                              ...prev, 
                              [photo.id]: e.target.value 
                            }))
                          }
                          onKeyPress={(e) => 
                            e.key === 'Enter' && addComment(photo.id)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => addComment(photo.id)}
                          disabled={!commentInputs[photo.id]?.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ))}
      
      <PhotoModal
        photo={selectedPhoto}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdatePhoto={onUpdatePhoto}
        readonly={readonly}
      />
    </div>
  );
};