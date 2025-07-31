import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Calendar, User, Users, MessageCircle, Send, ChevronDown, ChevronUp, MapPin, Navigation, BookmarkPlus } from "lucide-react";
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
  };
  onEdit: (retro: Retro) => void;
  onDelete: (retro: Retro) => void;
  onUpdateItem: (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => void;
  currentUserName: string;
}

export const RetroCard = ({ retro, onEdit, onDelete, onUpdateItem, currentUserName }: RetroCardProps) => {
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

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

    return (
      <div className={`p-3 rounded-lg border ${colorClass} transition-all duration-200`}>
        <p className="text-sm mb-2">{item.text}</p>
        
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
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {retro.date}
          </div>
        </div>
        <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {retro.title}
        </CardTitle>
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
        {/* Photos - Mock data for now until we migrate to new Retrospective type */}
        <PhotoDisplay
          photos={[]}
          readonly={true}
          showAsGrid={true}
        />
        {/* Roses */}
        {retro.roses && retro.roses.length > 0 && (
          <div>
            <h4 className="font-semibold text-positive mb-2 capitalize">Roses ({retro.roses.length})</h4>
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
          </div>
        )}

        {/* Buds */}
        {retro.buds && retro.buds.length > 0 && (
          <div>
            <h4 className="font-semibold text-opportunity mb-2 capitalize">Buds ({retro.buds.length})</h4>
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
          </div>
        )}

        {/* Thorns */}
        {retro.thorns && retro.thorns.length > 0 && (
          <div>
            <h4 className="font-semibold text-negative mb-2 capitalize">Thorns ({retro.thorns.length})</h4>
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
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t flex justify-end gap-2">
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
    </Card>
  );
};