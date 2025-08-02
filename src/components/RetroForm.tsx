import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MessageCircle, Send, MapPin, Flower, Lock, Users } from "lucide-react";
import { RBTItem, Comment, Retro } from "./RetroApp";
import { PhotoUpload } from "./PhotoUpload";
import { RetroPhoto } from "@/lib/supabase";
import { UserSelector } from "./UserSelector";
import { UserProfile } from "@/hooks/useRetros";

interface RetroFormProps {
  retro: Retro | null;
  onClose: () => void;
  onSave: (retro: Omit<Retro, 'id' | 'createdAt' | 'updatedAt'> & {
    locationName?: string;
    city?: string;
    state?: string;
    isPrivate?: boolean;
  }, attendeeUsers?: UserProfile[]) => void;
  currentUserName: string;
  feedbackSpaceMode?: boolean;
  initialData?: {
    title?: string;
    locationName?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

const eventTypes = [
  'Personal', 'Trip', 'Event', 'Work', 'Hobby', 'Learning', 
  'Social', 'Fitness', 'Home', 'Outdoor'
];

// Move RBTSection outside of RetroForm to prevent re-creation on every render
const RBTSection = React.memo(({ 
  type, 
  items, 
  title: sectionTitle,
  colorClass,
  updateRBTItem,
  addRBTItem,
  removeRBTItem,
  addComment,
  currentUserName
}: { 
  type: 'roses' | 'buds' | 'thorns'; 
  items: RBTItem[]; 
  title: string;
  colorClass: string;
  updateRBTItem: (type: 'roses' | 'buds' | 'thorns', index: number, field: keyof RBTItem, value: any) => void;
  addRBTItem: (type: 'roses' | 'buds' | 'thorns') => void;
  removeRBTItem: (type: 'roses' | 'buds' | 'thorns', index: number) => void;
  addComment: (type: 'roses' | 'buds' | 'thorns', itemIndex: number, commentText: string) => void;
  currentUserName: string;
}) => {
  console.log(`RBTSection ${type} rendering with ${items.length} items`);
  return (
    <Card className="shadow-md">
      <CardHeader className={`${colorClass} text-white rounded-t-lg`}>
        <CardTitle className="text-xl flex items-center gap-2">
          {type === 'roses' && <span>🌹</span>}
          {type === 'buds' && <Flower className="w-5 h-5" />}
          {type === 'thorns' && <span>🌿</span>}
          {sectionTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="border-2">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Created by: {item.ownerName || currentUserName}
                </span>
              </div>
              <Textarea
                placeholder={`Enter ${sectionTitle.toLowerCase()}...`}
                value={item.text}
                onChange={(e) => updateRBTItem(type, index, 'text', e.target.value)}
                className="min-h-[80px] resize-none"
              />
              
              {/* Photos for this item */}
              <PhotoUpload
                photos={item.photos || []}
                onPhotosChange={(photos) => updateRBTItem(type, index, 'photos', photos)}
                maxPhotos={2}
              />
              
              <div>
                <Label className="text-sm font-medium">Tags (comma-separated)</Label>
                <Input
                  placeholder="e.g., beach, kids, fun"
                  value={item.tags?.join(', ') || ''}
                  onChange={(e) => updateRBTItem(type, index, 'tags', e.target.value.split(',').map(tag => tag.trim()))}
                  className="mt-1"
                />
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t pt-3">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Comments ({item.comments?.length || 0})
                </Label>
                
                {item.comments && item.comments.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                    {item.comments.map((comment) => (
                      <div key={comment.id} className="bg-muted p-2 rounded text-sm">
                        <div className="font-semibold text-foreground">
                          {comment.authorName}
                          <span className="text-muted-foreground text-xs ml-2">
                            ({new Date(comment.timestamp).toLocaleDateString()})
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a comment..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        addComment(type, index, target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input?.value) {
                        addComment(type, index, input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {items.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeRBTItem(type, index)}
                    variant="destructive"
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        <Button
          type="button"
          onClick={() => addRBTItem(type)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {sectionTitle.slice(0, -1)}
        </Button>
      </CardContent>
    </Card>
  );
});

export const RetroForm = ({ retro, onClose, onSave, currentUserName, feedbackSpaceMode = false, initialData }: RetroFormProps) => {
  const [title, setTitle] = useState(retro?.title || initialData?.title || '');
  const [eventType, setEventType] = useState(retro?.eventType || 'Personal');
  const [date, setDate] = useState(retro?.date || new Date().toISOString().split('T')[0]);
  const ownerName = currentUserName; // Always use current user as owner
  const [attendees, setAttendees] = useState(retro?.attendees?.join(', ') || '');
  const [attendeeUsers, setAttendeeUsers] = useState<UserProfile[]>([]);
  const [isPrivate, setIsPrivate] = useState((retro as any)?.is_private || false);
  const [locationName, setLocationName] = useState(retro?.locationName || initialData?.locationName || '');
  const [city, setCity] = useState(retro?.city || initialData?.city || '');
  const [state, setState] = useState(retro?.state || initialData?.state || '');
  const [roses, setRoses] = useState<RBTItem[]>(() => {
    if (retro?.roses) {
      return retro.roses.map(item => ({
        ...item,
        ownerName: item.ownerName || currentUserName,
        photos: item.photos || []
      }));
    }
    return [{ id: 'roses-initial', text: '', tags: [], comments: [], ownerName: currentUserName, photos: [] }];
  });
  const [buds, setBuds] = useState<RBTItem[]>(() => {
    if (retro?.buds) {
      return retro.buds.map(item => ({
        ...item,
        ownerName: item.ownerName || currentUserName,
        photos: item.photos || []
      }));
    }
    return [{ id: 'buds-initial', text: '', tags: [], comments: [], ownerName: currentUserName, photos: [] }];
  });
  const [thorns, setThorns] = useState<RBTItem[]>(() => {
    if (retro?.thorns) {
      return retro.thorns.map(item => ({
        ...item,
        ownerName: item.ownerName || currentUserName,
        photos: item.photos || []
      }));
    }
    return [{ id: 'thorns-initial', text: '', tags: [], comments: [], ownerName: currentUserName, photos: [] }];
  });
  const [photos, setPhotos] = useState<RetroPhoto[]>([]);
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState<string>(() => {
    if (retro?.primaryPhotoUrl && typeof retro.primaryPhotoUrl === 'string') {
      return retro.primaryPhotoUrl;
    }
    return '';
  });

  // Load existing attendee users when editing
  React.useEffect(() => {
    console.log('RetroForm: Loading existing attendee users:', retro?.attendeeUsers);
    if (retro?.attendeeUsers) {
      setAttendeeUsers(retro.attendeeUsers);
      console.log('RetroForm: Set attendeeUsers to:', retro.attendeeUsers);
    }
  }, [retro]);

  const updateRBTItem = useCallback((type: 'roses' | 'buds' | 'thorns', index: number, field: keyof RBTItem, value: any) => {
    const setters = { roses: setRoses, buds: setBuds, thorns: setThorns };
    setters[type](prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  }, []);

  const addRBTItem = useCallback((type: 'roses' | 'buds' | 'thorns') => {
    const setters = { roses: setRoses, buds: setBuds, thorns: setThorns };
    setters[type](prevItems => [...prevItems, { 
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      text: '', 
      tags: [], 
      comments: [],
      ownerName: currentUserName,
      photos: []
    }]);
  }, [currentUserName]);

  const removeRBTItem = useCallback((type: 'roses' | 'buds' | 'thorns', index: number) => {
    const setters = { roses: setRoses, buds: setBuds, thorns: setThorns };
    setters[type](prevItems => prevItems.filter((_, i) => i !== index));
  }, []);

  const addComment = useCallback((type: 'roses' | 'buds' | 'thorns', itemIndex: number, commentText: string) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      authorName: currentUserName,
      timestamp: new Date().toISOString(),
    };

    const currentItems = type === 'roses' ? roses : type === 'buds' ? buds : thorns;
    const currentComments = currentItems[itemIndex].comments || [];
    
    updateRBTItem(type, itemIndex, 'comments', [...currentComments, newComment]);
  }, [roses, buds, thorns, currentUserName, updateRBTItem]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🔥 HANDLE SUBMIT TRIGGERED! 🔥');
    console.log('handleSubmit: Form submission started');
    console.log('handleSubmit: Current attendeeUsers:', attendeeUsers);
    e.preventDefault();

    const parsedAttendees = attendees.split(',').map(a => a.trim()).filter(Boolean);

    const processItems = (items: RBTItem[]) => 
      items.filter(item => item.text.trim()).map(item => ({
        ...item,
        tags: item.tags.filter(tag => tag.trim())
      }));

    const retroData = {
      title,
      eventType,
      date,
      ownerName,
      attendees: parsedAttendees,
      roses: processItems(roses),
      buds: processItems(buds),
      thorns: processItems(thorns),
      photos: photos, // Include photos in the saved data
      primaryPhotoUrl: primaryPhotoUrl || undefined,
      locationName: locationName.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      isPrivate, // Include privacy setting
    };

    console.log('RetroForm: Submitting retro data:', retroData);
    console.log('RetroForm: Submitting attendee users:', attendeeUsers);

    onSave(retroData, attendeeUsers);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {feedbackSpaceMode 
                ? 'Add Feedback to Event' 
                : retro ? 'Edit Retrospective' : 'Create New Retrospective'}
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter retrospective title..."
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ownerName">Owner</Label>
              <Input
                id="ownerName"
                value={ownerName}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          </div>

          <div>
            <Label>Tagged Attendees</Label>
            <UserSelector
              selectedUsers={attendeeUsers}
              onUsersChange={setAttendeeUsers}
              placeholder="Search and tag users who attended..."
            />
          </div>

          <div>
            <Label htmlFor="attendees">Additional Attendees (text only)</Label>
            <Input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="e.g., John Doe, Jane Smith (for non-registered users)"
              className="mt-1"
            />
          </div>

          {/* Location Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <Label className="text-base font-semibold">Location (Optional)</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g., Disneyland"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Anaheim"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., CA"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isPrivate ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <Label htmlFor="privacy-toggle" className="text-base font-semibold">
                    Privacy Settings
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPrivate 
                    ? "Private - Only you can view this retrospective" 
                    : "Public - Your friends can view this retrospective"
                  }
                </p>
              </div>
              <Switch
                id="privacy-toggle"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </div>


          {/* RBT Sections */}
          <div className="space-y-6">
            <RBTSection 
              type="roses" 
              items={roses} 
              title="Rose (what went well)" 
              colorClass="bg-gradient-positive"
              updateRBTItem={updateRBTItem}
              addRBTItem={addRBTItem}
              removeRBTItem={removeRBTItem}
              addComment={addComment}
              currentUserName={currentUserName}
            />
            <RBTSection 
              type="buds" 
              items={buds} 
              title="Bud (What are the opportunities?)" 
              colorClass="bg-gradient-opportunity"
              updateRBTItem={updateRBTItem}
              addRBTItem={addRBTItem}
              removeRBTItem={removeRBTItem}
              addComment={addComment}
              currentUserName={currentUserName}
            />
            <RBTSection 
              type="thorns" 
              items={thorns} 
              title="Thorn (what were the challenges?)" 
              colorClass="bg-gradient-negative"
              updateRBTItem={updateRBTItem}
              addRBTItem={addRBTItem}
              removeRBTItem={removeRBTItem}
              addComment={addComment}
              currentUserName={currentUserName}
            />
          </div>

          {/* Primary Photo Selection */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold">Primary Photo for Tile</h3>
            <p className="text-sm text-muted-foreground">Select a photo from your R/B/T items to display on the retro tile</p>
            
            {/* Get all photos from all RBT items */}
            {(() => {
              const allPhotos: { photo: RetroPhoto; source: string }[] = [];
              roses.forEach((item, idx) => item.photos?.forEach(photo => allPhotos.push({ photo, source: `Rose ${idx + 1}` })));
              buds.forEach((item, idx) => item.photos?.forEach(photo => allPhotos.push({ photo, source: `Bud ${idx + 1}` })));
              thorns.forEach((item, idx) => item.photos?.forEach(photo => allPhotos.push({ photo, source: `Thorn ${idx + 1}` })));
              
              return allPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allPhotos.map(({ photo, source }, index) => (
                    <div 
                      key={`${photo.id}-${index}`}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        primaryPhotoUrl === photo.url ? 'border-primary ring-2 ring-primary/50' : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setPrimaryPhotoUrl(photo.url === primaryPhotoUrl ? '' : photo.url)}
                    >
                      <img src={photo.url} alt={`From ${source}`} className="w-full h-20 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-1 truncate">
                        {source}
                      </div>
                      {primaryPhotoUrl === photo.url && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No photos added to R/B/T items yet. Add photos to individual items above to select a primary photo.</p>
              );
            })()}
          </div>

          {/* General Photos Section */}
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={3}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {feedbackSpaceMode 
                ? 'Submit Feedback' 
                : retro ? 'Update Retro' : 'Create Retro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};