import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeed } from '@/hooks/useFeed';
import { useRetros } from '@/hooks/useRetros';
import { ActivityCard } from '@/components/ActivityCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Plus, Users, Calendar, Heart, Home, MapPin, Clock } from 'lucide-react';
import { RetroApp } from '@/components/RetroApp';
import { Badge } from '@/components/ui/badge';

export default function Feed() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activities, loading: feedLoading, refetch } = useFeed();
  const { retros, loading: retrosLoading, fetchRetros } = useRetros();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleRetroClick = (retroId: string) => {
    navigate(`/trip/${retroId}`);
  };

  const handleRetroShare = (retroId: string) => {
    const retroUrl = `${window.location.origin}/trip/${retroId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Retrospective',
        url: retroUrl,
      });
    } else {
      navigator.clipboard.writeText(retroUrl);
    }
  };

  return (
    <div>
      <RetroApp />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                <Home className="h-8 w-8 text-purple-600" />
                Your Feed
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your friends' latest retro activities and manage your retrospectives
              </p>
            </div>
            
            <Button onClick={() => navigate('/create-retro')}>
              <Plus className="h-4 w-4 mr-2" />
              New Retro
            </Button>
          </div>

          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Activity Feed
              </TabsTrigger>
              <TabsTrigger value="retros" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Retros
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="mt-6">
              {/* Feed Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={feedLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${feedLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {feedLoading ? (
                    // Loading skeletons
                    [...Array(5)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onRetroClick={handleRetroClick}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-center text-gray-500">
                          No recent activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <p className="text-gray-600 mb-4">
                          Follow friends or create retrospectives to see activities here!
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => navigate('/create-retro')}>
                            Create First Retro
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/retros')}>
                            View All Retros
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retros" className="mt-6">
              {/* Individual Retros Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Your Retrospectives</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchRetros}
                    disabled={retrosLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${retrosLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {/* Quick Actions for Retros */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/create-retro')}>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium">Create Retro</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/catalogues')}>
                    <CardContent className="p-4 text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium">Catalogues</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/explore')}>
                    <CardContent className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium">Explore</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {retrosLoading ? (
                    // Loading skeletons
                    [...Array(6)].map((_, i) => (
                      <Card key={i} className="h-48">
                        <CardContent className="p-4 h-full">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-20 w-full" />
                        </CardContent>
                      </Card>
                    ))
                  ) : retros.length > 0 ? (
                    retros.slice(0, 12).map((retro) => (
                      <Card 
                        key={retro.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-purple-200"
                        onClick={() => handleRetroClick(retro.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-lg truncate text-gray-900">
                                {retro.title}
                              </h3>
                              <Badge variant="secondary" className="ml-2 shrink-0">
                                {retro.event_type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600 gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(retro.date).toLocaleDateString()}
                              </div>
                              {retro.location_name && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">{retro.location_name}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex gap-3 text-gray-600">
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                                  {retro.roses?.length || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  {retro.buds?.length || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                  {retro.thorns?.length || 0}
                                </span>
                              </div>
                              
                              {retro.attendeeUsers && retro.attendeeUsers.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-600">{retro.attendeeUsers.length}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-full">
                      <CardHeader>
                        <CardTitle className="text-center text-gray-500">
                          No retrospectives yet
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <p className="text-gray-600 mb-4">
                          Create your first retrospective to get started!
                        </p>
                        <Button onClick={() => navigate('/create-retro')}>
                          Create First Retro
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}