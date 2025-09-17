import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFeed } from '@/hooks/useFeed';
import { ActivityCard } from '@/components/ActivityCard';
import { RBTItemDetailModal } from '@/components/RBTItemDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Plus, Users, Calendar } from 'lucide-react';
import { RetroHeader } from '@/components/RetroHeader';
import { AppHeader } from '@/components/AppHeader';
import { RBTItem } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

export default function Feed() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = React.useState({
    keywords: '',
    tags: '',
    user: '',
    location: '',
    rbtType: '',
    eventType: ''
  });
  const [selectedRBTItem, setSelectedRBTItem] = useState<{
    item: RBTItem;
    type: 'roses' | 'buds' | 'thorns';
    retroId: string;
    retroTitle: string;
    retroOwnerName: string;
  } | null>(null);
  const { activities, loading, refetch } = useFeed(filters);

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

  const handleRBTItemClick = async (activity: any) => {
    // Extract R/B/T item data from activity
    const itemData = activity.data;
    const activityType = activity.activity_type;
    
    let type: 'roses' | 'buds' | 'thorns';
    switch (activityType) {
      case 'rose_added':
        type = 'roses';
        break;
      case 'bud_added':
        type = 'buds';
        break;
      case 'thorn_added':
        type = 'thorns';
        break;
      default:
        return; // Should not happen for R/B/T activities
    }

    // Fetch actual retrospective data to get R/B/T items
    try {
      const { data: retroData, error } = await supabase
        .from('retrospectives')
        .select('*')
        .eq('id', activity.target_id)
        .single();

      if (error || !retroData) {
        console.error('Error fetching retro data:', error);
        return;
      }

      // Get the items array for the type
      const items = (retroData[type] as unknown as RBTItem[]) || [];
      
      if (items.length === 0) {
        console.error('No items found for type:', type);
        return;
      }

      // Get the most recent item (last in array, as new items are typically added to the end)
      const rbtItem = items[items.length - 1];

      setSelectedRBTItem({
        item: rbtItem,
        type,
        retroId: activity.target_id,
        retroTitle: itemData.title || retroData.title || 'Untitled Retro',
        retroOwnerName: activity.user_profiles?.display_name || 'Unknown'
      });
    } catch (error) {
      console.error('Error fetching R/B/T item details:', error);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Retro App Header */}
          <RetroHeader 
            onSearchKeywords={(keywords) => setFilters(prev => ({ ...prev, keywords }))}
            onFilterTags={(tags) => setFilters(prev => ({ ...prev, tags }))}
            onSearchUser={(user) => setFilters(prev => ({ ...prev, user }))}
            onLocationSearch={(location) => setFilters(prev => ({ ...prev, location }))}
            onFilterRBTType={(rbtType) => setFilters(prev => ({ ...prev, rbtType }))}
            onFilterEventType={(eventType) => setFilters(prev => ({ ...prev, eventType }))}
          />
          
          {/* Feed Content */}
          <div className="max-w-2xl mx-auto">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Your Feed
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with your friends' latest retro activities
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={refetch}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/create-retro')}>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Create Retro</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/my-retros')}>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">My Retros</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/travel-planner')}>
              <CardContent className="p-4 text-center">
                <Plus className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Travel Planner</p>
              </CardContent>
            </Card>
          </div>

          {/* Activities Feed */}
          <div className="space-y-4">
            {loading ? (
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
                  onRBTItemClick={handleRBTItemClick}
                />
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-gray-500">
                    No activities yet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-gray-600 mb-4">
                    Start following friends or create your first retrospective to see activities here!
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => navigate('/create-retro')}>
                      Create First Retro
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/my-retros')}>
                      View My Retros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>

        {/* R/B/T Item Detail Modal */}
        {selectedRBTItem && (
          <RBTItemDetailModal
            item={selectedRBTItem.item}
            type={selectedRBTItem.type}
            retroId={selectedRBTItem.retroId}
            retroTitle={selectedRBTItem.retroTitle}
            retroOwnerName={selectedRBTItem.retroOwnerName}
            isOpen={true}
            onClose={() => setSelectedRBTItem(null)}
            onUpdateItem={() => {}} // Read-only from feed
            currentUserName={user?.user_metadata?.display_name || 'You'}
          />
        )}
      </div>
    </>
  );
}