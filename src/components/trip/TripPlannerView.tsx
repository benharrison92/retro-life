import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, MapPin, DollarSign, MessageCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTripPlannerItems, TripPlanner, TripPlannerItem } from '@/hooks/useTripPlanners';
import { AddTripItemDialog } from './AddTripItemDialog';
import { TripCalendarView } from './TripCalendarView';
import { EditTripItemDialog } from './EditTripItemDialog';

interface TripPlannerViewProps {
  tripPlanner: TripPlanner;
  onBack: () => void;
}

export const TripPlannerView = ({ tripPlanner, onBack }: TripPlannerViewProps) => {
  const { items, loading, refreshItems } = useTripPlannerItems(tripPlanner.id);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<TripPlannerItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'accommodation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'travel': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'activity': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.event_type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const handleItemClick = (item: TripPlannerItem) => {
    setSelectedItem(item);
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedItem(null);
    // Refresh items to get updated data
    refreshItems();
  };

  // Update selectedItem when items are refreshed and we have a selected item
  useEffect(() => {
    if (selectedItem && items.length > 0) {
      const updatedItem = items.find(item => item.id === selectedItem.id);
      if (updatedItem) {
        setSelectedItem(updatedItem);
      }
    }
  }, [items, selectedItem?.id]);

  if (loading) {
    return <div className="text-center py-8">Loading trip items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip Planners
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{tripPlanner.title}</h2>
            {tripPlanner.description && (
              <p className="text-muted-foreground">{tripPlanner.description}</p>
            )}
            {(tripPlanner.start_date || tripPlanner.end_date) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {tripPlanner.start_date && new Date(tripPlanner.start_date).toLocaleDateString()}
                  {tripPlanner.start_date && tripPlanner.end_date && ' - '}
                  {tripPlanner.end_date && new Date(tripPlanner.end_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="accommodation">🏨 Accommodation</SelectItem>
                <SelectItem value="travel">✈️ Travel</SelectItem>
                <SelectItem value="activity">🎯 Activity</SelectItem>
                <SelectItem value="food">🍽️ Food</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="booked">✅ Booked</SelectItem>
                <SelectItem value="pending_review">⏳ Pending Review</SelectItem>
                <SelectItem value="declined">❌ Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding items to your trip itinerary
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleItemClick(item)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getEventTypeIcon(item.event_type)}</span>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getEventTypeColor(item.event_type)}>
                          {item.event_type.charAt(0).toUpperCase() + item.event_type.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {(item.start_date || item.end_date || item.scheduled_date || item.scheduled_time) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {(item.start_date || item.scheduled_date) && 
                              new Date(item.start_date || item.scheduled_date).toLocaleDateString()}
                            {item.end_date && item.start_date && ' - '}
                            {item.end_date && new Date(item.end_date).toLocaleDateString()}
                            {item.scheduled_time && ` at ${item.scheduled_time}`}
                          </span>
                        </div>
                      )}
                      
                      {item.location_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{item.location_name}</span>
                        </div>
                      )}
                      
                      {item.estimated_cost && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${item.estimated_cost}</span>
                        </div>
                      )}
                    </div>
                    
                    {item.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                        <strong>Notes:</strong> {item.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <TripCalendarView 
            items={filteredItems} 
            tripPlanner={tripPlanner}
            onAddItem={() => setShowAddDialog(true)}
          />
        </TabsContent>
      </Tabs>

      <AddTripItemDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        tripPlannerId={tripPlanner.id}
      />

      <EditTripItemDialog
        item={selectedItem}
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
      />
    </div>
  );
};