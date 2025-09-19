import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  User, 
  MessageCircle, 
  Send, 
  X, 
  BookmarkPlus,
  Calendar,
  Tag
} from "lucide-react";
import { RBTItem } from "@/lib/supabase";
import { PhotoDisplay } from "@/components/PhotoDisplay";
import { FriendTagInput } from "@/components/FriendTagInput";
import { SaveToCatalogueDialog } from "@/components/catalogue/SaveToCatalogueDialog";
import { useTaggedComments } from "@/hooks/useTaggedComments";
import { useAuth } from "@/hooks/useAuth";

interface RBTItemDetailModalProps {
  item: RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } };
  type: 'roses' | 'buds' | 'thorns';
  retroId: string;
  retroTitle: string;
  retroOwnerName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => void;
  onUserClick?: (userName: string) => void;
  currentUserName: string;
}

export function RBTItemDetailModal({
  item,
  type,
  retroId,
  retroTitle,
  retroOwnerName,
  isOpen,
  onClose,
  onUpdateItem,
  onUserClick,
  currentUserName,
}: RBTItemDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyTaggedFriends, renderCommentWithTags } = useTaggedComments();
  const [commentInput, setCommentInput] = useState('');

  const getTypeInfo = (type: 'roses' | 'buds' | 'thorns') => {
    switch (type) {
      case 'roses':
        return {
          title: 'Rose',
          emoji: '🌹',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'buds':
        return {
          title: 'Bud',
          emoji: '🌱',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'thorns':
        return {
          title: 'Thorn',
          emoji: '🌿',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const typeInfo = getTypeInfo(type);

  const handleAddComment = async () => {
    const commentText = commentInput.trim();
    if (!commentText) return;

    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      authorName: currentUserName,
      timestamp: new Date().toISOString(),
    };

    const updatedItem = {
      ...item,
      comments: [...(item.comments || []), newComment]
    };

    // Use the source retro ID if this is an aggregated child item
    const targetRetroId = (item as any)?.source?.retroId || retroId;
    
    onUpdateItem(targetRetroId, type, item.id, updatedItem);
    setCommentInput('');

    // Notify tagged friends
    await notifyTaggedFriends(commentText, targetRetroId, item.id, retroTitle);
  };

  const openGoogleMaps = () => {
    try {
      let mapsUrl;
      if (item.place_id) {
        // Use Google Maps with place_id - more reliable format
        mapsUrl = `https://maps.google.com/?cid=${item.place_id}`;
      } else {
        // Use direct Google Maps search URL
        const query = encodeURIComponent(`${item.place_name} ${item.place_address || ''}`);
        mapsUrl = `https://maps.google.com/?q=${query}`;
      }
      // Open in new tab with noopener for security
      const newWindow = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback if popup blocked - copy to clipboard and show message
        navigator.clipboard?.writeText(mapsUrl);
        alert('Link copied to clipboard! Paste it in your browser to view the location.');
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      // Final fallback: copy location name to clipboard
      const locationText = `${item.place_name} ${item.place_address || ''}`;
      navigator.clipboard?.writeText(locationText);
      alert('Location copied to clipboard!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">{typeInfo.emoji}</span>
            <span className={`${typeInfo.color} font-semibold`}>{typeInfo.title} Details</span>
          </DialogTitle>
        </DialogHeader>

          <div className="space-y-6">
            {/* Navigation to full retro */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className="text-sm text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 w-fit"
              >
                <Calendar className="w-3 h-3 mr-1" />
                From: {retroTitle}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/trip/${retroId}`)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                View Full Retro
              </Button>
            </div>

            {/* Source tag for child items */}
            {item.source?.isChildItem && (
              <Badge 
                variant="outline" 
                className="text-sm text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 w-fit"
              >
                <Calendar className="w-3 h-3 mr-1" />
                From: {item.source.retroTitle}
              </Badge>
            )}

          {/* Main content */}
          <div className={`p-4 rounded-lg ${typeInfo.bgColor} ${typeInfo.borderColor} border-2`}>
            <p className="text-lg leading-relaxed">{item.text}</p>
          </div>

          {/* Creator info */}
          {item.ownerName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created by:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUserClick?.(item.ownerName!)}
                className="h-auto p-1 text-sm font-medium"
              >
                {item.ownerName}
              </Button>
            </div>
          )}

          {/* Location */}
          {item.place_name && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Location:</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start p-3"
                onClick={openGoogleMaps}
              >
                <MapPin className="w-4 h-4 mr-3 text-blue-600" />
                <div className="text-left flex-1">
                  <div className="font-medium">{item.place_name}</div>
                  {item.place_address && (
                    <div className="text-muted-foreground text-sm">{item.place_address}</div>
                  )}
                  {item.place_rating && (
                    <div className="text-muted-foreground text-sm">⭐ {item.place_rating}/5</div>
                  )}
                </div>
              </Button>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {tag === 'accommodation' ? '🏨 Accommodation' :
                     tag === 'food' ? '🍽️ Food' :
                     tag === 'activity' ? '🎯 Activity' :
                     tag === 'travel' ? '🚗 Travel' :
                     tag === 'entertainment' ? '🎭 Entertainment' :
                     tag === 'shopping' ? '🛍️ Shopping' :
                     tag === 'event' ? '🎪 Event' :
                     tag === 'other' ? '📝 Other' : tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {item.photos && item.photos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Photos:</h3>
              <PhotoDisplay
                photos={item.photos}
                readonly={true}
                showAsGrid={true}
              />
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Comments ({item.comments?.length || 0})
              </h3>
            </div>

            {/* Existing comments */}
            {item.comments && item.comments.length > 0 && (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {item.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {comment.authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{comment.authorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleDateString()} at {' '}
                          {new Date(comment.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">
                      {renderCommentWithTags(comment.text)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add new comment */}
            {user && (
              <div className="space-y-3">
                <FriendTagInput
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={setCommentInput}
                  className="min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <SaveToCatalogueDialog
                    retroId={retroId}
                    item={item}
                    itemType={type === 'roses' ? 'rose' : type === 'buds' ? 'bud' : 'thorn'}
                    savedFromUserId={user.id}
                    savedFromUserName={retroOwnerName}
                  >
                    <Button variant="outline" size="sm">
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      Save to Catalogue
                    </Button>
                  </SaveToCatalogueDialog>
                  
                  <Button 
                    onClick={handleAddComment}
                    disabled={!commentInput.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
