import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTripPlanners, useTripPlannerItems } from '@/hooks/useTripPlanners';
import { CreateTripPlannerDialog } from './CreateTripPlannerDialog';

interface AddToTripPlannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  catalogueItem: {
    id: string;
    title: string;
    description?: string;
    location_name?: string;
    location_address?: string;
  };
}

export const AddToTripPlannerDialog = ({ 
  isOpen, 
  onClose, 
  catalogueItem 
}: AddToTripPlannerDialogProps) => {
  const [selectedTripPlannerId, setSelectedTripPlannerId] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const { tripPlanners } = useTripPlanners();
  const { addItem } = useTripPlannerItems(selectedTripPlannerId);

  const handleAddToPlanner = async () => {
    if (!selectedTripPlannerId) return;

    setLoading(true);
    try {
      await addItem({
        title: catalogueItem.title,
        description: catalogueItem.description,
        event_type: 'other',
        status: 'pending_review',
        location_name: catalogueItem.location_name,
        location_address: catalogueItem.location_address,
        catalogue_item_id: catalogueItem.id,
      });
      
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAdd = () => {
    setShowCreateDialog(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Add to Trip Planner
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-md">
              <h4 className="font-medium text-sm">{catalogueItem.title}</h4>
              {catalogueItem.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {catalogueItem.description}
                </p>
              )}
            </div>

            {tripPlanners.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  No trip planners found. Create one first.
                </p>
                <Button onClick={handleCreateAndAdd} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trip Planner
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Trip Planner</Label>
                  <Select value={selectedTripPlannerId} onValueChange={setSelectedTripPlannerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a trip planner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tripPlanners.map((planner) => (
                        <SelectItem key={planner.id} value={planner.id}>
                          <div>
                            <div className="font-medium">{planner.title}</div>
                            {(planner.start_date || planner.end_date) && (
                              <div className="text-xs text-muted-foreground">
                                {planner.start_date && new Date(planner.start_date).toLocaleDateString()}
                                {planner.start_date && planner.end_date && ' - '}
                                {planner.end_date && new Date(planner.end_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddToPlanner} 
                    disabled={!selectedTripPlannerId || loading}
                    className="flex-1"
                  >
                    {loading ? "Adding..." : "Add to Planner"}
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={handleCreateAndAdd}
                  className="w-full text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Or create new trip planner
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CreateTripPlannerDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
};