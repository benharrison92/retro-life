import { useState } from 'react';
import { MessageCircle, Send, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CatalogueItem } from '@/lib/supabase';

interface CatalogueItemDiscussionProps {
  item: CatalogueItem;
  isOpen: boolean;
  onClose: () => void;
}

interface DiscussionMessage {
  id: string;
  text: string;
  authorName: string;
  timestamp: string;
  taggedMembers?: string[];
}

export const CatalogueItemDiscussion = ({ item, isOpen, onClose }: CatalogueItemDiscussionProps) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [taggedMembers, setTaggedMembers] = useState<string[]>([]);

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
      case 'rose': return 'bg-green-100 text-green-800';
      case 'bud': return 'bg-yellow-100 text-yellow-800';
      case 'thorn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: DiscussionMessage = {
      id: Date.now().toString(),
      text: newMessage,
      authorName: 'You', // TODO: Get from auth context
      timestamp: new Date().toISOString(),
      taggedMembers: taggedMembers.length > 0 ? [...taggedMembers] : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setTaggedMembers([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
              {(item as any).place_name && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-xs mb-3 justify-start hover:bg-muted/50"
                  onClick={() => {
                    try {
                      let mapsUrl;
                      if ((item as any).place_id) {
                        // Use place_id for more accurate results
                        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${(item as any).place_id}`;
                      } else {
                        // Fallback to search query
                        const query = encodeURIComponent(`${(item as any).place_name} ${(item as any).place_address || ''}`);
                        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
                      }
                      window.open(mapsUrl, '_blank');
                    } catch (error) {
                      console.error('Error opening Google Maps:', error);
                      // Fallback: copy location to clipboard
                      navigator.clipboard?.writeText(`${(item as any).place_name} ${(item as any).place_address || ''}`);
                    }
                  }}
                >
                  <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-foreground">{(item as any).place_name}</div>
                    {(item as any).place_address && (
                      <div className="text-muted-foreground text-xs truncate">{(item as any).place_address}</div>
                    )}
                    {(item as any).place_rating && (
                      <div className="text-muted-foreground text-xs">⭐ {(item as any).place_rating}/5</div>
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
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Start a discussion about including this in your trip planner</p>
                <p className="text-sm">Tag members to get their input on this recommendation</p>
              </div>
            ) : (
              messages.map((message) => (
                <Card key={message.id}>
                  <CardContent className="pt-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{message.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    {message.taggedMembers && message.taggedMembers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.taggedMembers.map((member, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            @{member}
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
            {taggedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {taggedMembers.map((member, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    @{member}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => setTaggedMembers(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="Share your thoughts about including this in the trip planner... (Use @ to tag members)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] resize-none"
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