import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRetros } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import TripDetail from '@/components/TripDetail';
import { RetroCard } from '@/components/RetroCard';
import { AppHeader } from '@/components/AppHeader';
import { RetroBreadcrumb } from '@/components/RetroBreadcrumb';
import { ChildRetrosList } from '@/components/ChildRetrosList';
import { SaveAsDialog } from '@/components/SaveAsDialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Globe, Network } from 'lucide-react';
const Trip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { retros, loading, updateRetro, updateLocalRetro } = useRetros();
  const { profile } = useAuth();
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsMode, setSaveAsMode] = useState<'featured' | 'child'>('featured');

  const retro = useMemo(() => retros.find(r => r.id === id), [retros, id]);
  const currentUserName = profile?.display_name || 'You';

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
    const r = retros.find(rr => rr.id === retroId);
    if (!r) return;
    const updated = { ...r, [itemType]: (r as any)[itemType].map((it: any) => it.id === itemId ? updatedItem : it) };
    updateLocalRetro(retroId, updated);
    await updateRetro(retroId, updated);
  };

  const handleAddItem = async (retroId: string, itemType: 'roses' | 'buds' | 'thorns') => {
    const r = retros.find(rr => rr.id === retroId);
    if (!r) return;
    const newItem = {
      id: `${itemType}-${Date.now()}`,
      text: '',
      tags: [],
      comments: [],
      ownerName: currentUserName,
      photos: []
    };
    const updated = { ...r, [itemType]: [...(r as any)[itemType], newItem] };
    updateLocalRetro(retroId, updated);
    await updateRetro(retroId, updated);
  };

  const handleUpdateRetro = async (updatedRetro: any) => {
    updateLocalRetro(updatedRetro.id, updatedRetro);
    await updateRetro(updatedRetro.id, updatedRetro);
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

  // Convert to legacy Retro type expected by RetroCard
  const legacyRetro = {
    id: retro.id,
    title: retro.title,
    eventType: retro.event_type,
    date: retro.date,
    ownerName: (retro as any).ownerName || currentUserName,
    attendees: retro.attendees || [],
    attendeeUsers: (retro as any).attendeeUsers || [],
    roses: retro.roses || [],
    buds: retro.buds || [],
    thorns: retro.thorns || [],
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
      
      <div className="container py-6 space-y-6">
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
          stats={{ likes: 0, comments: 0, hasLiked: false }}
          onBack={handleBack}
          onLikeToggle={() => {}}
          onShare={(rid) => handleShare(rid)}
        />

        {/* Child Retrospectives */}
        <ChildRetrosList
          parentRetroId={retro.id}
          onAddChild={handleAddChildRetro}
        />

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-foreground">Reflection (R/B/T)</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddChildRetro}
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
            onEdit={() => {}}
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
      </div>
    </div>
  );
};

export default Trip;
