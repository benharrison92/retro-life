import { useState } from 'react';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTripPlanners, TripPlanner } from '@/hooks/useTripPlanners';
import { CreateTripPlannerDialog } from './CreateTripPlannerDialog';

interface TripPlannerManagerProps {
  onSelectTripPlanner: (tripPlanner: TripPlanner) => void;
}

export const TripPlannerManager = ({ onSelectTripPlanner }: TripPlannerManagerProps) => {
  const { tripPlanners, loading } = useTripPlanners();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (loading) {
    return <div className="text-center py-8">Loading trip planners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trip Planners</h2>
          <p className="text-muted-foreground">Create and manage your travel itineraries</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trip Planner
        </Button>
      </div>

      {tripPlanners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No trip planners yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first trip planner to start organizing your travel itinerary
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trip Planner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tripPlanners.map((tripPlanner) => (
            <Card
              key={tripPlanner.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectTripPlanner(tripPlanner)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{tripPlanner.title}</CardTitle>
                {tripPlanner.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tripPlanner.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(tripPlanner.start_date || tripPlanner.end_date) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {tripPlanner.start_date && new Date(tripPlanner.start_date).toLocaleDateString()}
                        {tripPlanner.start_date && tripPlanner.end_date && ' - '}
                        {tripPlanner.end_date && new Date(tripPlanner.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Trip Planner
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tripPlanner.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTripPlannerDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};