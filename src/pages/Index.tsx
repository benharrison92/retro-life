import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RetroApp } from "@/components/RetroApp";
import PostCard from "@/components/PostCard";
import { useRetros } from '@/hooks/useRetros';
import { toast } from 'sonner';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { retros } = useRetros();
  const featuredPosts = retros.slice(0, 6).map((r) => ({
    id: r.id,
    title: r.title,
    excerpt: r.event_type ? `${r.event_type} — ${r.date}` : r.date,
    images: [{ url: r.primaryPhotoUrl || '/placeholder.svg', alt: r.title }],
    author: { id: r.user_id, name: (r as any).ownerName || 'Owner', avatarUrl: null },
    createdAt: r.created_at,
    location: { name: r.location_name || r.city || r.state || '' },
    likeCount: 0,
    commentCount: 0,
    bookmarked: false,
    hasLiked: false,
  }));

  const handleOpen = (postId: string) => {
    navigate(`/trip/${postId}`);
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/trip/${postId}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: 'Trip retro',
          text: 'Check out this trip retro',
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch (e) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {}
    }
  };

  useEffect(() => {
    console.log('Index: loading =', loading, 'user =', user?.id);
    
    // Only redirect if we're done loading and there's no user
    if (!loading && !user) {
      console.log('Redirecting to auth - no user found');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    console.log('Index: Still loading auth state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user after loading is complete, return null (will redirect via useEffect)
  if (!user) {
    console.log('Index: No user, rendering null');
    return null;
  }

  console.log('Index: Rendering RetroApp for user', user.id);
  return (
    <>
      <div id="retro-root"><RetroApp /></div>
      <section className="container py-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Featured trips</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((p) => (
            <PostCard
              key={p.id}
              {...p}
              onOpen={(id) => handleOpen(id)}
              onShare={(id) => handleShare(id)}
              onLikeToggle={async (id, next) => console.log('like', id, next)}
              onBookmarkToggle={async (id, next) => console.log('bookmark', id, next)}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Index;
