import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRetros } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import { useAggregatedRetro } from '@/hooks/useAggregatedRetro';
import { useRetroInteractions } from '@/hooks/useRetroInteractions';
import TripDetail from '@/components/TripDetail';
import { RetroCard } from '@/components/RetroCard';
import { AppHeader } from '@/components/AppHeader';
import { RetroBreadcrumb } from '@/components/RetroBreadcrumb';
import { ChildRetrosList } from '@/components/ChildRetrosList';
import { SaveAsDialog } from '@/components/SaveAsDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Globe, Network, Eye, EyeOff } from 'lucide-react';
import { AddRBTDialog } from '@/components/AddRBTDialog';
const Trip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { retros, loading, updateRetro, updateLocalRetro } = useRetros();
  const { profile } = useAuth();
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState<'featured' | 'child' | 'make_child'>('featured');
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<'roses' | 'buds' | 'thorns'>('roses');
  const [showSubRetrosDialog, setShowSubRetrosDialog] = useState(false);
  const [showRelatedTripsDialog, setShowRelatedTripsDialog] = useState(false);

  const retro = useMemo(() => retros.find(r => r.id === id), [retros, id]);
  const currentUserName = profile?.display_name || 'You';
  
  // Use aggregated retro hook to get parent + child items
  const { aggregatedRetro, childItemsCount, showChildItems, toggleChildItems, refreshChildRetros } = useAggregatedRetro(retro);
  
  // Use retro interactions hook for likes and comments
  const { stats, comments, loading: interactionsLoading, toggleLike, addComment, deleteComment } = useRetroInteractions(id || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!retro) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">Trip not found.</p>
      </div>
    );
  }

  // Build TripDetail props from retro
  const coverUrl = retro.primaryPhotoUrl || retro.photos?.[0]?.url || '/placeholder.svg';
  const images = (retro.photos || []).slice(1).map(p => ({ url: p.url, alt: p.caption || retro.title }));
  const author = { id: retro.user_id, name: (retro as any).ownerName || currentUserName, avatarUrl: null };
  const locationName = retro.location_name || retro.city || retro.state || undefined;
  const location = {
    name: locationName,
    lat: retro.latitude,
    lng: retro.longitude,
  };

  const handleShare = async (retroId: string) => {
    const shareUrl = `${window.location.origin}/trip/${retroId}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: 'Trip retro', text: 'Check out this trip retro', url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      try { await navigator.clipboard.writeText(shareUrl); } catch {}
    }
  };

  const handleBack = () => {
    // If this retro has a parent, navigate to parent instead of home
    if ((retro as any)?.parent_id) {
      navigate(`/trip/${(retro as any).parent_id}`);
    } else {
      try {
        const idx = (window.history.state && (window.history.state as any).idx) ?? 0;
        if (idx > 0 || window.history.length > 1) navigate(-1);
        else navigate('/');
      } catch {
        navigate('/');
      }
    }
  };

  // Minimal handlers to support R/B/T interactions
  const handleUpdateItem = async (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: any) => {
    // Find the retro that actually contains this item (search all retros)
    let targetRetro = retros.find(r => (r as any)[itemType]?.some((it: any) => it.id === itemId))
      || retros.find(r => r.id === retroId);

    if (!targetRetro) return;

    console.log('handleUpdateItem: updating', { targetRetroId: targetRetro.id, itemType, itemId });

    const updated = {
      ...targetRetro,
      [itemType]: (targetRetro as any)[itemType].map((it: any) => it.id === itemId ? updatedItem : it)
    };

    updateLocalRetro(targetRetro.id, updated);
    await updateRetro(targetRetro.id, updated);
    await refreshChildRetros();
  };

  const handleAddItem = async (retroId: string, itemType: 'roses' | 'buds' | 'thorns') => {
    setAddItemType(itemType);
    setAddItemDialogOpen(true);
  };

  const handleConfirmAddItem = async (
    text: string,
    tags: string[],
    placeData?: {
      place_id?: string;
      place_name?: string;
      place_address?: string;
      place_rating?: number;
      place_types?: string[];
    }
  ) => {
    const r = retros.find(rr => rr.id === id);
    if (!r) return;
    const newItem = {
      id: `${addItemType}-${Date.now()}`,
      text,
      tags,
      comments: [],
      ownerName: currentUserName,
      photos: [],
      ...(placeData && {
        place_id: placeData.place_id,
        place_name: placeData.place_name,
        place_address: placeData.place_address,
        place_rating: placeData.place_rating,
        place_types: placeData.place_types,
      }),
    };
    const updated = { ...r, [addItemType]: [...(r as any)[addItemType], newItem] };
    updateLocalRetro(r.id, updated);
    await updateRetro(r.id, updated);
  };

  const handleUpdateRetro = async (updatedRetro: any) => {
    updateLocalRetro(updatedRetro.id, updatedRetro);
    await updateRetro(updatedRetro.id, updatedRetro);
  };

  const handleToggleRetroPrivacy = async () => {
    if (!retro || !profile) return;
    
    const updatedRetro = {
      ...retro,
      is_private: !retro.is_private
    };
    
    // Update local state first for immediate UI feedback
    updateLocalRetro(retro.id, updatedRetro);
    // Then update the database
    await updateRetro(retro.id, updatedRetro);
  };

  const handleAddChildRetro = () => {
    navigate(`/create-retro?parent_id=${retro?.id}`);
  };

  const handleSaveAsFeatured = () => {
    setSaveAsMode('featured');
    setSaveAsDialogOpen(true);
  };

  const handleSaveAsChild = () => {
    setSaveAsMode('child');
    setSaveAsDialogOpen(true);
  };

  const handleAddSubRetro = () => {
    setSaveAsMode('make_child');
    setSaveAsDialogOpen(true);
  };

  const handleSubRetrosClick = () => {
    setShowSubRetrosDialog(true);
  };

  const handleRelatedTripsClick = () => {
    setShowRelatedTripsDialog(true);
  };

  // Get count of child retros
  const childRetros = retros.filter(r => (r as any).parent_id === retro?.id);
  const subRetrosCount = childRetros.length;

  // Convert to legacy Retro type expected by RetroCard with aggregated items
  const legacyRetro = {
    id: retro.id,
    title: retro.title,
    eventType: retro.event_type,
    date: retro.date,
    ownerName: (retro as any).ownerName || currentUserName,
    attendees: retro.attendees || [],
    attendeeUsers: (retro as any).attendeeUsers || [],
    roses: aggregatedRetro.roses,
    buds: aggregatedRetro.buds,
    thorns: aggregatedRetro.thorns,
    photos: retro.photos || [],
    primaryPhotoUrl: retro.primaryPhotoUrl,
    locationName: retro.location_name,
    city: retro.city,
    state: retro.state,
    country: retro.country,
    latitude: retro.latitude,
    longitude: retro.longitude,
    createdAt: new Date(retro.created_at),
    updatedAt: retro.updated_at ? new Date(retro.updated_at) : undefined,
  } as any;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Breadcrumb Navigation */}
      {retro && (
        <div className="container mx-auto px-4 py-2">
          <RetroBreadcrumb retroId={retro.id} />
        </div>
      )}
      
      <div className="container py-6 space-y-3">
        <TripDetail
          id={retro.id}
          title={retro.title}
          cover={{ url: coverUrl, alt: retro.title }}
          images={images}
          author={author}
          createdAt={retro.created_at}
          startDate={retro.date}
          location={location.name ? location : undefined}
          itinerary={[]}
          stats={stats}
          comments={comments}
          commentsLoading={interactionsLoading}
          onBack={handleBack}
          onLikeToggle={toggleLike}
          onShare={(rid) => handleShare(rid)}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onSubRetrosClick={() => setShowSubRetrosDialog(true)}
          onRelatedTripsClick={() => setShowRelatedTripsDialog(true)}
          subRetrosCount={subRetrosCount}
          isPrivate={retro.is_private}
          onTogglePrivacy={handleToggleRetroPrivacy}
          canEditRetro={profile?.id === retro.user_id}
        />

        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-foreground">Reflection (R/B/T)</h2>
              {childItemsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChildItems}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  {showChildItems ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showChildItems ? 'Hide' : 'Show'} Sub-Retro Items ({childItemsCount})
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubRetro}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Sub-Retro
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSaveAsFeatured}>
                    <Globe className="h-4 w-4 mr-2" />
                    Save as Featured Retro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSaveAsChild}>
                    <Network className="h-4 w-4 mr-2" />
                    Save as Sub-Retro
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <RetroCard
            retro={legacyRetro}
            onEdit={() => navigate(`/create-retro?edit=${retro.id}`)}
            onDelete={() => {}}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onUserClick={() => {}}
            onUpdateRetro={handleUpdateRetro}
            currentUserName={currentUserName}
          />
        </section>

        {/* Save As Dialog */}
        {retro && (
          <SaveAsDialog
            isOpen={saveAsDialogOpen}
            onClose={() => setSaveAsDialogOpen(false)}
            retroId={retro.id}
            retroTitle={retro.title}
            mode={saveAsMode}
          />
        )}

        {/* Add RBT Item Dialog */}
        <AddRBTDialog
          isOpen={addItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          onSubmit={handleConfirmAddItem}
          type={addItemType}
        />

        {/* Sub-Retros Dialog */}
        <Dialog open={showSubRetrosDialog} onOpenChange={setShowSubRetrosDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Sub-Retrospectives</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto">
              <ChildRetrosList
                parentRetroId={retro.id}
                onAddChild={handleAddChildRetro}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Related Trips Dialog */}
        <Dialog open={showRelatedTripsDialog} onOpenChange={setShowRelatedTripsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Related Trips</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto p-4">
              <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                Show similar posts by location or tags.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Trip;
