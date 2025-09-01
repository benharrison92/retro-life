import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, ArrowRight, TrendingUp } from 'lucide-react';
import { RetroApp } from "@/components/RetroApp";
import PostCard from "@/components/PostCard";
import { ParentRetroCard } from "@/components/ParentRetroCard";
import { useRetros } from '@/hooks/useRetros';
import { Retrospective } from '@/lib/supabase';
import { toast } from 'sonner';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { retros, fetchParentRetros } = useRetros();
  const [parentRetros, setParentRetros] = useState<Retrospective[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  
  const featuredRetros = retros.filter(r => !r.is_private).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const featuredPosts = featuredRetros.slice(0, 6).map((r) => ({
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

  useEffect(() => {
    const loadParentRetros = async () => {
      if (user && !loading) {
        setLoadingParents(true);
        const parents = await fetchParentRetros();
        setParentRetros(parents);
        setLoadingParents(false);
      }
    };
    
    loadParentRetros();
  }, [user, loading, fetchParentRetros]);

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
      
      {/* Enhanced Retro Features */}
      <section className="container py-6">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary text-primary-foreground rounded-full">
                  <Network className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Hierarchical Retrospectives</CardTitle>
                  <p className="text-muted-foreground">
                    Break down your experiences into organized sub-retrospectives - from trips to cities to specific events
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your retrospectives now support parent-child relationships. Create detailed breakdowns like:
              <br />
              <strong>Europe 2025</strong> → <strong>Transportation</strong> → <strong>Flight Experience</strong>
              <br />
              <strong>Europe 2025</strong> → <strong>Paris</strong> → <strong>Louvre Museum</strong>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Primary Parent Trips Section */}
      <section className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Your Journeys</h2>
              <p className="text-muted-foreground">Main trips and experiences you've documented</p>
            </div>
          </div>
        </div>
        
        {loadingParents ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : parentRetros.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {parentRetros.map((parentRetro) => (
              <ParentRetroCard
                key={parentRetro.id}
                parentRetro={parentRetro}
                onOpen={handleOpen}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-medium mb-2">No journeys yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first journey to start documenting your experiences
              </p>
              <Button onClick={() => navigate('/create')}>
                Create Journey
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="container py-8 border-t">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">All Recent Trips</h2>
          {featuredRetros.length > 6 && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/featured-trips')}
              className="flex items-center gap-2"
            >
              View All ({featuredRetros.length})
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
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
