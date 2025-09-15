import { useState } from 'react';
import { TripPlannerManager } from '@/components/trip/TripPlannerManager';
import { TripPlannerView } from '@/components/trip/TripPlannerView';
import { TripPlanner } from '@/hooks/useTripPlanners';
import { AppHeader } from '@/components/AppHeader';

export default function TripPlanners() {
  const [selectedTripPlanner, setSelectedTripPlanner] = useState<TripPlanner | null>(null);

  if (selectedTripPlanner) {
    return (
      <>
        <AppHeader />
        <TripPlannerView
          tripPlanner={selectedTripPlanner}
          onBack={() => setSelectedTripPlanner(null)}
        />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto p-6">
        <TripPlannerManager
          onSelectTripPlanner={setSelectedTripPlanner}
        />
      </div>
    </>
  );
}