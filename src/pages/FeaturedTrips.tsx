import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from "@/components/AppHeader";
import PostCard from "@/components/PostCard";
import { useRetros } from '@/hooks/useRetros';

const FeaturedTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { retros } = useRetros();
  
  const featuredRetros = retros
    .filter(r => !r.is_private)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const featuredPosts = featuredRetros.map((r) => ({
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

  if (!user) {
    return null;
  }

  return (
    <>
      <AppHeader />
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Featured Trips</h1>
          <p className="text-muted-foreground mt-2">
            All {featuredRetros.length} featured retrospectives, sorted by most recent
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
              onOpen={(id) => handleOpen(id)}
              onShare={(id) => handleShare(id)}
              onLikeToggle={async (id, next) => console.log('like', id, next)}
              onBookmarkToggle={async (id, next) => console.log('bookmark', id, next)}
            />
          ))}
        </div>
        
        {featuredRetros.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No featured trips yet. Make a retrospective featured to see it here!
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default FeaturedTrips;