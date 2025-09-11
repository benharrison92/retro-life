import { useState } from 'react';
import { MessageCircle, Send, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CatalogueFriendTagInput } from './CatalogueFriendTagInput';
import { useTaggedComments } from '@/hooks/useTaggedComments';
import { useCatalogueDiscussion } from '@/hooks/useCatalogueDiscussion';
import { useCatalogueMembers } from '@/hooks/useCatalogueMembers';
import { useAuth } from '@/hooks/useAuth';
import { CatalogueItem } from '@/lib/supabase';

interface CatalogueItemDiscussionProps {
  item: CatalogueItem;
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogueItemDiscussion = ({ item, isOpen, onClose }: CatalogueItemDiscussionProps) => {
  const { user } = useAuth();
  const { discussions, loading, addDiscussion, deleteDiscussion } = useCatalogueDiscussion(item.id);
  const { members } = useCatalogueMembers(item.catalogue_id);
  const { renderCommentWithTags, extractTaggedFriends } = useTaggedComments();
  const [newMessage, setNewMessage] = useState('');

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'rose': return '🌹';
      case 'bud': return '🌱';
      case 'thorn': return '🌿';
      default: return '•';
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'rose': return 'bg-positive-muted text-positive';
      case 'bud': return 'bg-opportunity-muted text-opportunity';
      case 'thorn': return 'bg-negative-muted text-negative';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Extract tagged friend display names and map to user IDs
    const taggedDisplayNames = extractTaggedFriends(newMessage);
    const taggedUserIds: string[] = [];

    // Map display names to user IDs from catalogue members
    taggedDisplayNames.forEach(displayName => {
      const member = members.find(m => m.user_profile?.display_name === displayName);
      if (member) {
        taggedUserIds.push(member.user_id);
      }
    });
    
    await addDiscussion(newMessage, taggedUserIds);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canDeleteDiscussion = (discussion: any) => {
    return user && (user.id === discussion.user_id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getItemTypeIcon(item.item_type)}</span>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={getItemTypeColor(item.item_type)}>
                  {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  From: {item.saved_from_user_name}
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Item Content */}
          <Card>
            <CardContent className="pt-4">
              <p className="mb-3">{item.item_text}</p>
              
              {/* Location display if available */}
              {item.place_name && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-xs mb-3 justify-start hover:bg-muted/50"
                  onClick={() => {
                    try {
                      let mapsUrl;
                      if (item.place_id) {
                        // More reliable maps domain
                        mapsUrl = `https://maps.google.com/?cid=${item.place_id}`;
                      } else {
                        const query = encodeURIComponent(`${item.place_name} ${item.place_address || ''}`);
                        mapsUrl = `https://maps.google.com/?q=${query}`;
                      }
                      const newWindow = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                      if (!newWindow) {
                        navigator.clipboard?.writeText(mapsUrl);
                        alert('Link copied to clipboard! Paste it in your browser to view the location.');
                      }
                    } catch (error) {
                      console.error('Error opening Google Maps:', error);
                      const locationText = `${item.place_name} ${item.place_address || ''}`;
                      navigator.clipboard?.writeText(locationText);
                      alert('Location copied to clipboard!');
                    }
                  }}
                >
                  <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-foreground">{item.place_name}</div>
                    {item.place_address && (
                      <div className="text-muted-foreground text-xs truncate">{item.place_address}</div>
                    )}
                    {item.place_rating && (
                      <div className="text-muted-foreground text-xs">⭐ {item.place_rating}/5</div>
                    )}
                  </div>
                </Button>
              )}

              {item.item_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.item_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discussion Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                <p>Loading discussions...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start a discussion about including this in your trip planner</p>
                <p className="text-sm">Tag members to get their input on this recommendation</p>
              </div>
            ) : (
              discussions.map((discussion) => (
                <Card key={discussion.id}>
                  <CardContent className="pt-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={discussion.user_profiles?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {discussion.user_profiles?.display_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {discussion.user_profiles?.display_name || 'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(discussion.created_at).toLocaleTimeString()}
                        </span>
                        {canDeleteDiscussion(discussion) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => deleteDiscussion(discussion.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      {renderCommentWithTags(discussion.message)}
                    </div>
                    {discussion.tagged_users && discussion.tagged_users.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {discussion.tagged_users.map((user, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            @{user.display_name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <CatalogueFriendTagInput
                placeholder="Share your thoughts about including this in the trip planner... (Use @ to tag members)"
                value={newMessage}
                onChange={setNewMessage}
                onKeyDown={handleKeyPress}
                className="min-h-[60px] resize-none"
                members={members}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Discuss whether to include this in your trip planner. Tag members with @ to get their input.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};