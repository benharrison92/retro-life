import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, MapPin, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RetroCard } from '@/components/RetroCard';
import { AggregatedFeedback } from '@/components/feedback/AggregatedFeedback';
import { useFeedbackSpaces, type FeedbackSpace } from '@/hooks/useFeedbackSpaces';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';

const FeedbackSpace = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFeedbackSpaceByCode, getFeedbackSpaceRetros } = useFeedbackSpaces();
  const [feedbackSpace, setFeedbackSpace] = useState<FeedbackSpace | null>(null);
  const [retros, setRetros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbackSpace = async () => {
      if (!code) {
        toast.error('Invalid feedback space code');
        navigate('/');
        return;
      }

      try {
        const space = await getFeedbackSpaceByCode(code);
        if (!space) {
          toast.error('Feedback space not found or inactive');
          navigate('/');
          return;
        }

        setFeedbackSpace(space);
        
        const spaceRetros = await getFeedbackSpaceRetros(space.id);
        setRetros(spaceRetros);
      } catch (error) {
        console.error('Error loading feedback space:', error);
        toast.error('Failed to load feedback space');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackSpace();
  }, [code, getFeedbackSpaceByCode, getFeedbackSpaceRetros, navigate]);

  const handleCreateRetro = () => {
    if (!user) {
      toast.error('Please sign in to leave feedback');
      navigate('/auth');
      return;
    }
    navigate(`/create-retro?feedbackSpace=${feedbackSpace?.id}`);
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        </div>
      </>
    );
  }

  if (!feedbackSpace) {
    return (
      <>
        <AppHeader />
        <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Feedback Space Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The feedback space you're looking for doesn't exist or is no longer active.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{feedbackSpace.title}</h1>
          <p className="text-muted-foreground">Share your feedback about this event</p>
        </div>
        <Button onClick={handleCreateRetro}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      {/* Event Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Event Details
                <Badge variant="outline" className="font-mono">
                  {feedbackSpace.unique_code}
                </Badge>
              </CardTitle>
              {feedbackSpace.description && (
                <CardDescription className="mt-2">
                  {feedbackSpace.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(feedbackSpace.location_name || feedbackSpace.city) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {feedbackSpace.location_name && `${feedbackSpace.location_name}, `}
                  {feedbackSpace.city && feedbackSpace.state 
                    ? `${feedbackSpace.city}, ${feedbackSpace.state}` 
                    : feedbackSpace.city}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{retros.length} feedback submissions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retros and Aggregated View */}
      {retros.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your thoughts about this event!
            </p>
            <Button onClick={handleCreateRetro}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your Feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Individual Feedback ({retros.length})
            </TabsTrigger>
            <TabsTrigger value="aggregated" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Aggregated View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Individual Feedback</h2>
              <Button onClick={handleCreateRetro} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Feedback
              </Button>
            </div>
            <div className="grid gap-4">
              {retros.map((retro) => {
                // Convert database format to RetroCard expected format
                const convertedRetro = {
                  id: retro.id,
                  title: retro.title,
                  eventType: retro.event_type,
                  date: retro.date,
                  attendees: retro.attendees || [],
                  roses: Array.isArray(retro.roses) ? retro.roses : [],
                  buds: Array.isArray(retro.buds) ? retro.buds : [],
                  thorns: Array.isArray(retro.thorns) ? retro.thorns : [],
                  photos: Array.isArray(retro.photos) ? retro.photos : [],
                  locationName: retro.location_name,
                  city: retro.city,
                  state: retro.state,
                  country: retro.country,
                  ownerName: retro.user_profiles?.display_name || 'Anonymous',
                  createdAt: retro.created_at,
                };
                
                return (
                  <RetroCard
                    key={retro.id}
                    retro={convertedRetro}
                    currentUserName={user?.email || 'Anonymous'}
                    onEdit={() => {}} // View-only for feedback spaces
                    onDelete={() => {}} // View-only for feedback spaces
                    onUpdateItem={() => {}} // View-only for feedback spaces
                    onUpdateRetro={() => {}} // View-only for feedback spaces
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="aggregated" className="mt-6">
            <AggregatedFeedback retros={retros} />
          </TabsContent>
        </Tabs>
      )}
    </div>
    </>
  );
};

export default FeedbackSpace;