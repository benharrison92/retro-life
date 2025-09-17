import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit2, Trash2, Calendar, User, Users, MessageCircle, Send, ChevronDown, ChevronUp, MapPin, Navigation, BookmarkPlus, UserCheck, Megaphone, Lock } from "lucide-react";
import { Retro, RBTItem } from "./RetroApp";
import { LocationBadge, LocationInfo } from "./LocationDisplay";
import { PhotoDisplay } from "./PhotoDisplay";
import { RetroPhoto } from "@/lib/supabase";
import { SaveToCatalogueDialog } from "./catalogue/SaveToCatalogueDialog";
import { FriendTagInput } from "./FriendTagInput";
import { useTaggedComments } from "@/hooks/useTaggedComments";
import { useAuth } from "@/hooks/useAuth";
import { RBTItemDetailModal } from "./RBTItemDetailModal";

interface RetroCardProps {
  retro: Retro & {
    locationName?: string;
    city?: string;
    state?: string;
    country?: string;
    feedbackSpaceName?: string;
    feedbackSpaceId?: string;
    roses: (RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } })[];
    buds: (RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } })[];
    thorns: (RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } })[];
  };
  onEdit: (retro: Retro) => void;
  onDelete: (retro: Retro) => void;
  onUpdateItem: (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => void;
  onAddItem?: (retroId: string, itemType: 'roses' | 'buds' | 'thorns') => void;
  onUserClick?: (userName: string) => void;
  onUpdateRetro?: (retro: Retro) => void;
  currentUserName: string;
}

// Move RBTItemDisplay outside of RetroCard to prevent recreation on re-renders
const RBTItemDisplay = ({ 
  item, 
  type, 
  colorClass,
  expandedItems,
  commentInputs,
  toggleExpanded,
  handleAddComment,
  handleUpdateItemPhoto,
  setCommentInputs,
  onUserClick,
  retro,
  user,
  renderCommentWithTags,
  onItemClick
}: { 
  item: RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } }; 
  type: 'roses' | 'buds' | 'thorns';
  colorClass: string;
  expandedItems: { [key: string]: boolean };
  commentInputs: { [key: string]: string };
  toggleExpanded: (itemId: string) => void;
  handleAddComment: (itemType: 'roses' | 'buds' | 'thorns', item: RBTItem) => void;
  handleUpdateItemPhoto: (type: 'roses' | 'buds' | 'thorns', itemId: string, photoId: string, updatedPhoto: RetroPhoto) => void;
  setCommentInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  onUserClick?: (userName: string) => void;
  retro: any;
  user: any;
  renderCommentWithTags: (text: string) => JSX.Element;
  onItemClick: (item: RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } }, type: 'roses' | 'buds' | 'thorns') => void;
}) => {
  const isExpanded = expandedItems[item.id];
  const hasComments = item.comments && item.comments.length > 0;
  const hasPhotos = item.photos && item.photos.length > 0;
  const shadowClass = type === 'roses' 
    ? 'hover:shadow-glow-positive' 
    : type === 'buds' 
      ? 'hover:shadow-glow-opportunity' 
      : 'hover:shadow-glow-negative';

  return (
    <div className={`p-3 rounded-lg border ${colorClass} transition-all duration-200 ${shadowClass} hover-scale cursor-pointer`}>
      {/* Source tag for child items */}
      {item.source?.isChildItem && (
        <div className="mb-2">
          <Badge 
            variant="outline" 
            className="text-xs text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
          >
            From: {item.source.retroTitle}
          </Badge>
        </div>
      )}
      
      {/* Creator info */}
      <div className="flex justify-between items-start mb-2">
        <p 
          className="text-sm flex-1 hover:text-primary transition-colors" 
          onClick={() => onItemClick(item, type)}
        >
          {item.text}
        </p>
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

      {/* Location display */}
      {item.place_name && (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            className="h-auto p-2 text-xs w-full justify-start hover:bg-muted/50"
            onClick={() => {
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
        </div>
      )}
      
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
              {tag === 'accommodation' ? '🏨 Accommodation' :
               tag === 'food' ? '🍽️ Food' :
               tag === 'activity' ? '🎯 Activity' :
               tag === 'travel' ? '🚗 Travel' : tag}
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
                savedFromUserId={user.id}
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
                      <p className="text-muted-foreground mt-1">
                        {renderCommentWithTags(comment.text)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-1">
                <FriendTagInput
                  placeholder="Add comment..."
                  value={commentInputs[item.id] || ''}
                  onChange={(value) => setCommentInputs(prev => ({ ...prev, [item.id]: value }))}
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

export const RetroCard = ({ retro, onEdit, onDelete, onUpdateItem, onAddItem, onUserClick, onUpdateRetro, currentUserName }: RetroCardProps) => {
  const { user } = useAuth();
  const { notifyTaggedFriends, renderCommentWithTags } = useTaggedComments();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [selectedRBTItem, setSelectedRBTItem] = useState<{
    item: RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } };
    type: 'roses' | 'buds' | 'thorns';
  } | null>(null);

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

  const handleItemClick = (item: RBTItem & { source?: { retroId: string; retroTitle: string; isChildItem: boolean; } }, type: 'roses' | 'buds' | 'thorns') => {
    setSelectedRBTItem({ item, type });
  };

  const handleCloseModal = () => {
    setSelectedRBTItem(null);
  };

  const handleAddComment = async (itemType: 'roses' | 'buds' | 'thorns', item: RBTItem) => {
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

    // Prefer updating the actual source retro if this is an aggregated child item
    const targetRetroId = (item as any)?.source?.retroId || retro.id;
    console.log('Adding comment', { itemType, itemId: item.id, targetRetroId, newComment });

    onUpdateItem(targetRetroId, itemType, item.id, updatedItem);
    setCommentInputs(prev => ({ ...prev, [item.id]: '' }));

    // Notify tagged friends
    await notifyTaggedFriends(commentText, targetRetroId, item.id, retro.title);
  };

  const handleUpdateItemPhoto = async (itemType: 'roses' | 'buds' | 'thorns', itemId: string, photoId: string, updatedPhoto: RetroPhoto) => {
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
    
    try {
      await onUpdateItem(retro.id, itemType, itemId, updatedItem);
      console.log('RetroCard: Item photo updated successfully');
    } catch (error) {
      console.error('RetroCard: Error updating item photo:', error);
    }
  };

  const handleUpdateGeneralPhoto = async (photoId: string, updatedPhoto: RetroPhoto) => {
    console.log('RetroCard: handleUpdateGeneralPhoto called', { photoId, updatedPhoto });
    
    if (!retro.photos || !onUpdateRetro) {
      console.log('RetroCard: No photos or onUpdateRetro function');
      return;
    }
    
    const updatedPhotos = retro.photos.map(p => p.id === photoId ? updatedPhoto : p);
    const updatedRetro = { ...retro, photos: updatedPhotos };
    
    console.log('RetroCard: Calling onUpdateRetro with updated retro:', updatedRetro);
    
    try {
      await onUpdateRetro(updatedRetro);
      console.log('RetroCard: General photo updated successfully');
    } catch (error) {
      console.error('RetroCard: Error updating general photo:', error);
    }
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
                  expandedItems={expandedItems}
                  commentInputs={commentInputs}
                  toggleExpanded={toggleExpanded}
                  handleAddComment={handleAddComment}
                  handleUpdateItemPhoto={handleUpdateItemPhoto}
                  setCommentInputs={setCommentInputs}
                  onUserClick={onUserClick}
                  retro={retro}
                  user={user}
                  renderCommentWithTags={renderCommentWithTags}
                  onItemClick={handleItemClick}
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
                  expandedItems={expandedItems}
                  commentInputs={commentInputs}
                  toggleExpanded={toggleExpanded}
                  handleAddComment={handleAddComment}
                  handleUpdateItemPhoto={handleUpdateItemPhoto}
                  setCommentInputs={setCommentInputs}
                  onUserClick={onUserClick}
                  retro={retro}
                  user={user}
                  renderCommentWithTags={renderCommentWithTags}
                  onItemClick={handleItemClick}
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
                <span>🌵</span>
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
                  expandedItems={expandedItems}
                  commentInputs={commentInputs}
                  toggleExpanded={toggleExpanded}
                  handleAddComment={handleAddComment}
                  handleUpdateItemPhoto={handleUpdateItemPhoto}
                  setCommentInputs={setCommentInputs}
                  onUserClick={onUserClick}
                  retro={retro}
                  user={user}
                  renderCommentWithTags={renderCommentWithTags}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No thorns yet</p>
          )}
        </div>

        {/* Action buttons for retro owner */}
        {canEditRetro && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(retro)}
              className="flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(retro)}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>

      {/* RBT Item Detail Modal */}
      {selectedRBTItem && (
        <RBTItemDetailModal
          item={selectedRBTItem.item}
          type={selectedRBTItem.type}
          retroId={retro.id}
          retroTitle={retro.title}
          retroOwnerName={retro.ownerName}
          isOpen={!!selectedRBTItem}
          onClose={handleCloseModal}
          onUpdateItem={onUpdateItem}
          onUserClick={onUserClick}
          currentUserName={currentUserName}
        />
      )}
    </Card>
  );
};