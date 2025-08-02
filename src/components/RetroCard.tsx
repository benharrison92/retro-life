import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, Trash2, Calendar, User, Users, MessageCircle, Send, ChevronDown, ChevronUp, MapPin, Navigation, BookmarkPlus, UserCheck, Megaphone, Lock } from "lucide-react";
import { Retro, RBTItem } from "./RetroApp";
import { LocationBadge, LocationInfo } from "./LocationDisplay";
import { PhotoDisplay } from "./PhotoDisplay";
import { RetroPhoto } from "@/lib/supabase";
import { SaveToCatalogueDialog } from "./catalogue/SaveToCatalogueDialog";
import { useAuth } from "@/hooks/useAuth";

interface RetroCardProps {
  retro: Retro & {
    locationName?: string;
    city?: string;
    state?: string;
    country?: string;
    feedbackSpaceName?: string;
    feedbackSpaceId?: string;
  };
  onEdit: (retro: Retro) => void;
  onDelete: (retro: Retro) => void;
  onUpdateItem: (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => void;
  onAddItem?: (retroId: string, itemType: 'roses' | 'buds' | 'thorns') => void;
  onUserClick?: (userName: string) => void;
  onUpdateRetro?: (retro: Retro) => void;
  currentUserName: string;
}

export const RetroCard = ({ retro, onEdit, onDelete, onUpdateItem, onAddItem, onUserClick, onUpdateRetro, currentUserName }: RetroCardProps) => {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  // Check if current user can add items (owner or tagged attendee)
  const canAddItems = user && (
    // User is the owner
    retro.ownerName === currentUserName ||
    // User is in tagged attendees
    retro.attendeeUsers?.some(attendee => attendee.id === user.id)
  );

  // Check if current user can edit/delete the retro (only owner)
  const canEditRetro = user && retro.ownerName === currentUserName;

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleAddComment = (itemType: 'roses' | 'buds' | 'thorns', item: RBTItem) => {
    const commentText = commentInputs[item.id]?.trim();
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

    onUpdateItem(retro.id, itemType, item.id, updatedItem);
    setCommentInputs(prev => ({ ...prev, [item.id]: '' }));
  };

  const handleUpdateItemPhoto = (itemType: 'roses' | 'buds' | 'thorns', itemId: string, photoId: string, updatedPhoto: RetroPhoto) => {
    console.log('RetroCard: handleUpdateItemPhoto called', { itemType, itemId, photoId, updatedPhoto });
    
    const items = itemType === 'roses' ? retro.roses : itemType === 'buds' ? retro.buds : retro.thorns;
    const item = items?.find(i => i.id === itemId);
    if (!item || !item.photos) {
      console.log('RetroCard: Item or photos not found');
      return;
    }

    const updatedPhotos = item.photos.map(p => p.id === photoId ? updatedPhoto : p);
    const updatedItem = { ...item, photos: updatedPhotos };
    
    console.log('RetroCard: Calling onUpdateItem with updated item:', updatedItem);
    onUpdateItem(retro.id, itemType, itemId, updatedItem);
  };

  const handleUpdateGeneralPhoto = (photoId: string, updatedPhoto: RetroPhoto) => {
    console.log('RetroCard: handleUpdateGeneralPhoto called', { photoId, updatedPhoto });
    
    if (!retro.photos || !onUpdateRetro) {
      console.log('RetroCard: No photos or onUpdateRetro function');
      return;
    }
    
    const updatedPhotos = retro.photos.map(p => p.id === photoId ? updatedPhoto : p);
    const updatedRetro = { ...retro, photos: updatedPhotos };
    
    console.log('RetroCard: Calling onUpdateRetro with updated retro:', updatedRetro);
    onUpdateRetro(updatedRetro);
  };

  const RBTItemDisplay = ({ 
    item, 
    type, 
    colorClass 
  }: { 
    item: RBTItem; 
    type: 'roses' | 'buds' | 'thorns';
    colorClass: string;
  }) => {
    const isExpanded = expandedItems[item.id];
    const hasComments = item.comments && item.comments.length > 0;
    const hasPhotos = item.photos && item.photos.length > 0;

    return (
      <div className={`p-3 rounded-lg border ${colorClass} transition-all duration-200`}>
        {/* Creator info */}
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm flex-1">{item.text}</p>
          {item.ownerName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUserClick?.(item.ownerName!)}
              className="text-xs h-auto p-1 ml-2 text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <User className="w-3 h-3" />
              {item.ownerName}
            </Button>
          )}
        </div>
        
        {/* Show photos for this item */}
        {hasPhotos && (
          <div className="mb-3">
            <PhotoDisplay
              photos={item.photos || []}
              readonly={false}
              showAsGrid={true}
              onUpdatePhoto={(photoId, updatedPhoto) => handleUpdateItemPhoto(type, item.id, photoId, updatedPhoto)}
            />
          </div>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {(hasComments || true) && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                className="flex items-center gap-1 text-xs p-1 h-auto"
              >
                <MessageCircle className="w-3 h-3" />
                {item.comments?.length || 0} comment{(item.comments?.length || 0) !== 1 ? 's' : ''}
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              
              {user && (
                <SaveToCatalogueDialog
                  retroId={retro.id}
                  item={item}
                  itemType={type === 'roses' ? 'rose' : type === 'buds' ? 'bud' : 'thorn'}
                  savedFromUserId={user.id} // We'll use a placeholder for now
                  savedFromUserName={retro.ownerName}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs p-1 h-auto"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    Save
                  </Button>
                </SaveToCatalogueDialog>
              )}
            </div>

            {isExpanded && (
              <div className="mt-2 space-y-2">
                {hasComments && (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {item.comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 p-2 rounded text-xs">
                        <div className="font-medium text-foreground">
                          {comment.authorName}
                          <span className="text-muted-foreground ml-1">
                            ({new Date(comment.timestamp).toLocaleDateString()})
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1">
                  <Input
                    placeholder="Add comment..."
                    value={commentInputs[item.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                    className="text-xs h-7"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(type, item);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(type, item)}
                    className="h-7 px-2"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-elegant hover:shadow-xl transition-all duration-300 flex flex-col h-full border-l-4 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{retro.eventType}</Badge>
            <LocationBadge 
              locationName={retro.locationName}
              city={retro.city}
              state={retro.state}
              country={retro.country}
              variant="outline"
              className="text-xs"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {/* Privacy indicator */}
            <div className="flex items-center gap-1">
              {(retro as any).is_private ? (
                <Lock className="w-4 h-4 text-amber-600" />
              ) : (
                <Users className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {retro.date}
            </div>
          </div>
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {retro.title}
        </CardTitle>
        
        {/* Feedback Space Tag - Display prominently when retro is part of a feedback space */}
        {retro.feedbackSpaceName && (
          <div className="mt-2 mb-1">
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm px-3 py-1 shadow-md"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Feedback Space: {retro.feedbackSpaceName}
            </Badge>
          </div>
        )}
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-medium">Owner:</span> {retro.ownerName}
          </div>
          {retro.attendees && retro.attendees.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="font-medium">Attendees:</span> {retro.attendees.join(', ')}
            </div>
          )}
          {retro.attendeeUsers && retro.attendeeUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <UserCheck className="w-3 h-3" />
              <span className="font-medium">Tagged:</span>
              <div className="flex items-center gap-1">
                {retro.attendeeUsers.map((attendeeUser, index) => (
                  <div key={attendeeUser.id} className="flex items-center gap-1">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {attendeeUser.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{attendeeUser.display_name}</span>
                    {index < retro.attendeeUsers.length - 1 && <span className="text-muted-foreground">,</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <LocationInfo
            locationName={retro.locationName}
            city={retro.city}
            state={retro.state}
            country={retro.country}
            className="text-xs"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        {/* User Permissions Info */}
        {user && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg flex items-center gap-2">
            {canAddItems ? (
              <>
                <span className="text-green-600">✓</span>
                <span>You can add new items, comment, and save</span>
              </>
            ) : (
              <>
                <span className="text-blue-600">👀</span>
                <span>You can comment and save items</span>
              </>
            )}
          </div>
        )}
        {/* General Photos */}
        {retro.photos && retro.photos.length > 0 && (
          <PhotoDisplay
            photos={retro.photos}
            readonly={false}
            showAsGrid={true}
            onUpdatePhoto={handleUpdateGeneralPhoto}
          />
        )}
        {/* Roses */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-positive capitalize">Roses ({retro.roses?.length || 0})</h4>
            {onAddItem && canAddItems && (
              <Button
                onClick={() => onAddItem(retro.id, 'roses')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs h-7"
              >
                <span>🌹</span>
                Add Rose
              </Button>
            )}
          </div>
          {retro.roses && retro.roses.length > 0 ? (
            <div className="space-y-2">
              {retro.roses.map((item) => (
                <RBTItemDisplay 
                  key={item.id} 
                  item={item} 
                  type="roses"
                  colorClass="bg-positive-muted border-positive/20"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No roses yet</p>
          )}
        </div>

        {/* Buds */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-opportunity capitalize">Buds ({retro.buds?.length || 0})</h4>
            {onAddItem && canAddItems && (
              <Button
                onClick={() => onAddItem(retro.id, 'buds')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs h-7"
              >
                <span>🌱</span>
                Add Bud
              </Button>
            )}
          </div>
          {retro.buds && retro.buds.length > 0 ? (
            <div className="space-y-2">
              {retro.buds.map((item) => (
                <RBTItemDisplay 
                  key={item.id} 
                  item={item} 
                  type="buds"
                  colorClass="bg-opportunity-muted border-opportunity/20"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No buds yet</p>
          )}
        </div>

        {/* Thorns */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-negative capitalize">Thorns ({retro.thorns?.length || 0})</h4>
            {onAddItem && canAddItems && (
              <Button
                onClick={() => onAddItem(retro.id, 'thorns')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-xs h-7"
              >
                <span>🌿</span>
                Add Thorn
              </Button>
            )}
          </div>
          {retro.thorns && retro.thorns.length > 0 ? (
            <div className="space-y-2">
              {retro.thorns.map((item) => (
                <RBTItemDisplay 
                  key={item.id} 
                  item={item} 
                  type="thorns"
                  colorClass="bg-negative-muted border-negative/20"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No thorns yet</p>
          )}
        </div>
      </CardContent>

      <div className="p-4 border-t flex justify-between items-center">
        {/* Permission indicator for non-owners/non-attendees */}
        {!canAddItems && user && (
          <div className="text-sm text-muted-foreground italic">
            You can comment and save items, but only attendees can add new ones
          </div>
        )}
        
        {/* Edit/Delete buttons - only for owner */}
        {canEditRetro && (
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={() => onEdit(retro)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(retro)}
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};