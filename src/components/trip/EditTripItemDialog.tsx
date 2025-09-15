import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, MapPin, DollarSign, MessageCircle, Send, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TripPlannerItem, useTripPlannerItems } from '@/hooks/useTripPlanners';
import { useTripPlannerDiscussions } from '@/hooks/useTripPlannerDiscussions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EditTripItemDialogProps {
  item: TripPlannerItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTripItemDialog = ({ item, isOpen, onClose }: EditTripItemDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateItem } = useTripPlannerItems(item?.trip_planner_id);
  const { discussions, loading: discussionsLoading, addDiscussion } = useTripPlannerDiscussions(item?.id);
  
  const initialFormData = {
    title: '',
    description: '',
    event_type: 'other' as 'accommodation' | 'travel' | 'activity' | 'food' | 'other',
    status: 'pending_review' as 'booked' | 'pending_review' | 'declined',
    scheduled_date: null as Date | null,
    scheduled_time: '',
    location_name: '',
    location_address: '',
    estimated_cost: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        event_type: item.event_type || 'other',
        status: item.status || 'pending_review',
        scheduled_date: item.scheduled_date ? new Date(item.scheduled_date) : null,
        scheduled_time: item.scheduled_time || '',
        location_name: item.location_name || '',
        location_address: item.location_address || '',
        estimated_cost: item.estimated_cost ? item.estimated_cost.toString() : '',
        notes: item.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;

    setIsSubmitting(true);
    try {
      await updateItem(item.id, {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        status: formData.status,
        scheduled_date: formData.scheduled_date?.toISOString().split('T')[0] || null,
        scheduled_time: formData.scheduled_time || null,
        location_name: formData.location_name,
        location_address: formData.location_address,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        notes: formData.notes,
      });

      toast({
        title: "Item updated",
        description: "Trip item has been updated successfully.",
      });
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error updating item",
        description: "Failed to update the trip item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDiscussion = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDiscussion(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error adding discussion:', error);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏨';
      case 'travel': return '✈️';
      case 'activity': return '🎯';
      case 'food': return '🍽️';
      case 'other': return '📝';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getEventTypeIcon(item.event_type)}</span>
            Edit Trip Item
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Item Details</TabsTrigger>
            <TabsTrigger value="discussion" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussion ({discussions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter item title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                    <SelectItem value="travel">✈️ Travel</SelectItem>
                    <SelectItem value="activity">🎯 Activity</SelectItem>
                    <SelectItem value="food">🍽️ Food</SelectItem>
                    <SelectItem value="other">📝 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_review">⏳ Pending Review</SelectItem>
                    <SelectItem value="booked">✅ Booked</SelectItem>
                    <SelectItem value="declined">❌ Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_date ? format(formData.scheduled_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_date || undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_date: date || null }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Scheduled Time</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                placeholder="Enter location name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_address">Location Address</Label>
              <Input
                id="location_address"
                value={formData.location_address}
                onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                placeholder="Enter full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="discussion" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {discussionsLoading ? (
                <div className="text-center py-4">Loading discussions...</div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No discussions yet. Start the conversation!</p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <Card key={discussion.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.user_profiles?.avatar_url} />
                          <AvatarFallback>
                            {discussion.user_profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {discussion.user_profiles?.display_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(discussion.created_at).toLocaleDateString()} at{' '}
                              {new Date(discussion.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{discussion.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Add to the discussion..."
                  className="flex-1"
                  rows={2}
                />
                <Button 
                  onClick={handleAddDiscussion}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};