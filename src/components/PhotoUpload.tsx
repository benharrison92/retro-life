import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Heart, MessageCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RetroPhoto, PhotoReaction, PhotoComment } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PhotoUploadProps {
  photos: RetroPhoto[];
  onPhotosChange: (photos: RetroPhoto[]) => void;
  maxPhotos?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 3,
}) => {
  const [uploading, setUploading] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('retro-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('retro-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too many photos',
        description: `You can only upload up to ${maxPhotos} photos per retro.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await uploadPhoto(file);
        if (url) {
          return {
            id: crypto.randomUUID(),
            url,
            caption: '',
            reactions: [],
            comments: [],
          } as RetroPhoto;
        }
        return null;
      });

      const uploadedPhotos = (await Promise.all(uploadPromises)).filter(Boolean) as RetroPhoto[];
      
      onPhotosChange([...photos, ...uploadedPhotos]);
      
      toast({
        title: 'Photos uploaded',
        description: `${uploadedPhotos.length} photo(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  const updateCaption = (photoId: string, caption: string) => {
    onPhotosChange(
      photos.map(p =>
        p.id === photoId ? { ...p, caption } : p
      )
    );
  };

  const addReaction = (photoId: string) => {
    if (!user || !profile) return;

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

    onPhotosChange(
      photos.map(p =>
        p.id === photoId
          ? { ...p, reactions: [...p.reactions, newReaction] }
          : p
      )
    );
  };

  const removeReaction = (photoId: string) => {
    if (!user) return;

    onPhotosChange(
      photos.map(p =>
        p.id === photoId
          ? { ...p, reactions: p.reactions.filter(r => r.user_id !== user.id) }
          : p
      )
    );
  };

  const addComment = (photoId: string) => {
    if (!user || !profile) return;

    const commentText = commentInputs[photoId]?.trim();
    if (!commentText) return;

    const newComment: PhotoComment = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: profile.display_name,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    onPhotosChange(
      photos.map(p =>
        p.id === photoId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    setCommentInputs(prev => ({ ...prev, [photoId]: '' }));
  };

  const userHasReacted = (photo: RetroPhoto): boolean => {
    return user ? photo.reactions.some(r => r.user_id === user.id) : false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Photos ({photos.length}/{maxPhotos})</h3>
        {photos.length < maxPhotos && (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="sr-only"
              id="photo-upload"
              disabled={uploading}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                type="button"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Photos
                  </>
                )}
              </Button>
            </label>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No photos yet. Add up to {maxPhotos} photos to your retro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={photo.url}
                  alt="Retro photo"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={() => removePhoto(photo.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Add a caption..."
                  value={photo.caption || ''}
                  onChange={(e) => updateCaption(photo.id, e.target.value)}
                  className="min-h-[60px] resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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

                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {photo.comments.length}
                    </Badge>
                  </div>
                </div>

                {photo.comments.length > 0 && (
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {photo.comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-medium">{comment.user_name}: </span>
                        <span className="text-muted-foreground">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}

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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};