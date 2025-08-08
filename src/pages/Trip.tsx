import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRetros } from '@/hooks/useRetros';
import { useAuth } from '@/hooks/useAuth';
import TripDetail from '@/components/TripDetail';
import { RetroCard } from '@/components/RetroCard';

const Trip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { retros, loading, updateRetro, updateLocalRetro } = useRetros();
  const { profile } = useAuth();

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
        onBack={() => navigate(-1)}
        onLikeToggle={() => {}}
        onShare={(rid) => handleShare(rid)}
      />

      <section>
        <h2 className="mb-3 text-xl font-semibold text-foreground">Reflection (R/B/T)</h2>
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
    </div>
  );
};

export default Trip;
