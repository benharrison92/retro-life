import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CatalogueManager } from '@/components/catalogue/CatalogueManager';
import { CatalogueView } from '@/components/catalogue/CatalogueView';
import { PendingCatalogueInvitations } from '@/components/catalogue/PendingCatalogueInvitations';
import { TripPlannerManager } from '@/components/trip/TripPlannerManager';
import { TripPlannerView } from '@/components/trip/TripPlannerView';
import { PendingTripPlannerInvitations } from '@/components/trip/PendingTripPlannerInvitations';
import { Catalogue } from '@/lib/supabase';
import { TripPlanner } from '@/hooks/useTripPlanners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Plus,
  Users,
  Plane,
  Archive,
  Route
} from 'lucide-react';

export default function TravelPlanner() {
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue | null>(null);
  const [selectedTripPlanner, setSelectedTripPlanner] = useState<TripPlanner | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'catalogues' | 'trip-planners'>('overview');

  // If viewing a specific catalogue or trip planner
  if (selectedCatalogue) {
    return (
      <>
        <AppHeader />
        <CatalogueView
          catalogue={selectedCatalogue}
          onBack={() => setSelectedCatalogue(null)}
        />
      </>
    );
  }

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          
          {/* Header with Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Travel Planning</h1>
                <p className="text-muted-foreground">Collect places, plan trips, create memories</p>
              </div>
            </div>

            {/* Navigation Pills */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <Button
                variant={activeView === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('overview')}
              >
                Overview
              </Button>
              <Button
                variant={activeView === 'catalogues' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('catalogues')}
              >
                <Archive className="h-4 w-4 mr-2" />
                My Backlog
              </Button>
              <Button
                variant={activeView === 'trip-planners' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('trip-planners')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Trip Plans
              </Button>
            </div>
          </div>

          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Quick Actions Row */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed border-2 hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Start Planning</h3>
                    <p className="text-sm text-muted-foreground">Create your first catalogue</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                      <Archive className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Organize</h3>
                    <p className="text-sm text-muted-foreground">Save places from your trips</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Route className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Execute</h3>
                    <p className="text-sm text-muted-foreground">Turn ideas into itineraries</p>
                  </CardContent>
                </Card>
              </div>

              {/* How It Works Flow */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Simple Travel Planning Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Archive className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">1. Build Your Backlog</h4>
                        <p className="text-sm text-muted-foreground">Save restaurants, hotels, and activities from your retrospectives and discoveries into organized catalogues.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-primary hidden md:block" />
                    </div>

                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">2. Plan Your Trip</h4>
                        <p className="text-sm text-muted-foreground">Create detailed itineraries by pulling items from your catalogues and adding dates, times, and details.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Action Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Catalogues Card */}
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Archive className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-orange-900 dark:text-orange-100">My Backlog</CardTitle>
                          <p className="text-sm text-orange-700 dark:text-orange-300">Your saved places & ideas</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Catalogues
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      Your personal collection of restaurants, hotels, activities, and destinations. 
                      Save memorable places from your travel retrospectives and organize them for future trips.
                    </p>
                    <Button 
                      onClick={() => setActiveView('catalogues')}
                      className="w-full group-hover:bg-orange-600"
                      size="sm"
                    >
                      Manage Backlog
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Trip Planners Card */}
                <Card className="hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-blue-900 dark:text-blue-100">Trip Plans</CardTitle>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Your detailed itineraries</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        <Route className="h-3 w-3 mr-1" />
                        Planners
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      Transform your backlog into detailed trip itineraries. Add dates, times, locations, 
                      and collaborate with travel companions to make your plans reality.
                    </p>
                    <Button 
                      onClick={() => setActiveView('trip-planners')}
                      className="w-full group-hover:bg-blue-600"
                      size="sm"
                    >
                      Plan Trips
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'catalogues' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Archive className="h-6 w-6 text-orange-600" />
                    My Travel Backlog
                  </h2>
                  <p className="text-muted-foreground">Organize your saved places and ideas by destination or theme</p>
                </div>
              </div>
              <PendingCatalogueInvitations />
              <CatalogueManager onSelectCatalogue={setSelectedCatalogue} />
            </div>
          )}

          {activeView === 'trip-planners' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    Trip Planners
                  </h2>
                  <p className="text-muted-foreground">Turn your backlog into detailed travel itineraries</p>
                </div>
              </div>
              <PendingTripPlannerInvitations />
              <TripPlannerManager onSelectTripPlanner={setSelectedTripPlanner} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}