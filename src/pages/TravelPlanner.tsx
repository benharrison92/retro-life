import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CatalogueManager } from '@/components/catalogue/CatalogueManager';
import { CatalogueView } from '@/components/catalogue/CatalogueView';
import { PendingCatalogueInvitations } from '@/components/catalogue/PendingCatalogueInvitations';
import { TripPlannerManager } from '@/components/trip/TripPlannerManager';
import { TripPlannerView } from '@/components/trip/TripPlannerView';
import { Catalogue } from '@/lib/supabase';
import { TripPlanner } from '@/hooks/useTripPlanners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  Plane, 
  Archive,
  Route,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function TravelPlanner() {
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue | null>(null);
  const [selectedTripPlanner, setSelectedTripPlanner] = useState<TripPlanner | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-6 py-8">
          
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6">
              <Plane className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
              Travel Planning Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Collect memorable places in your catalogues, then organize them into amazing trip itineraries.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="hover-scale transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Archive className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Collect</p>
                    <p className="text-sm text-muted-foreground">Save places & experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Route className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Organize</p>
                    <p className="text-sm text-muted-foreground">Plan your itineraries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Explore</p>
                    <p className="text-sm text-muted-foreground">Make memories happen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    1
                  </div>
                  <h4 className="font-semibold mb-2">Build Your Catalogues</h4>
                  <p className="text-sm text-muted-foreground">Save restaurants, hotels, activities, and places you want to visit from your retros and experiences.</p>
                </div>
                <div className="text-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto mb-3 md:block hidden" />
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold md:hidden">
                    2
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground items-center justify-center mx-auto mb-3 text-lg font-bold hidden md:flex">
                    2
                  </div>
                  <h4 className="font-semibold mb-2">Create Trip Plans</h4>
                  <p className="text-sm text-muted-foreground">Turn your saved places into organized itineraries with dates, times, and detailed planning.</p>
                </div>
                <div className="text-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto mb-3 md:block hidden" />
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold md:hidden">
                    3
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground items-center justify-center mx-auto mb-3 text-lg font-bold hidden md:flex">
                    3
                  </div>
                  <h4 className="font-semibold mb-2">Execute & Enjoy</h4>
                  <p className="text-sm text-muted-foreground">Follow your plan, check off items, and create amazing travel memories.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="catalogues" className="data-[state=active]:bg-background">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Catalogues
                </TabsTrigger>
                <TabsTrigger value="trip-planners" className="data-[state=active]:bg-background">
                  <Calendar className="h-4 w-4 mr-2" />
                  Trip Plans
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Catalogues Preview */}
                <Card className="border-0 shadow-lg hover-scale transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      My Catalogues
                    </CardTitle>
                    <p className="text-muted-foreground">Your collection of saved places and experiences</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Build your personal collection of restaurants, hotels, activities, and destinations. 
                      Save items from your retros and organize them by category or location.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('catalogues')}
                      className="w-full"
                    >
                      Manage Catalogues
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Trip Planners Preview */}
                <Card className="border-0 shadow-lg hover-scale transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      Trip Planners
                    </CardTitle>
                    <p className="text-muted-foreground">Turn your catalogues into detailed itineraries</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Create detailed trip itineraries using items from your catalogues. 
                      Add dates, times, locations, and collaborate with travel companions.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('trip-planners')}
                      className="w-full"
                    >
                      Plan Trips
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="catalogues" className="animate-fade-in">
              <div className="space-y-6">
                <PendingCatalogueInvitations />
                <CatalogueManager onSelectCatalogue={setSelectedCatalogue} />
              </div>
            </TabsContent>

            <TabsContent value="trip-planners" className="animate-fade-in">
              <TripPlannerManager onSelectTripPlanner={setSelectedTripPlanner} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}