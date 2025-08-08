import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RetroApp } from "@/components/RetroApp";
import PostCard from "@/components/PostCard";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const samplePosts = [
    {
      id: 'p1',
      title: 'Sunrise over Big Sur',
      excerpt: 'Cliffside drive, fog lifting, coffee in hand.',
      images: [{ url: '/placeholder.svg', alt: 'Big Sur sunrise' }],
      author: { id: 'u1', name: 'Ava Carter', avatarUrl: null },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      location: { name: 'Big Sur, CA' },
      likeCount: 128,
      commentCount: 14,
      bookmarked: false,
      hasLiked: false,
    },
    {
      id: 'p2',
      title: 'Kyoto in blossom',
      excerpt: 'Early morning at Fushimi Inari.',
      images: [{ url: '/placeholder.svg', alt: 'Kyoto torii gates' }],
      author: { id: 'u2', name: 'Kenji Sato', avatarUrl: null },
      createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      location: { name: 'Kyoto, JP' },
      likeCount: 342,
      commentCount: 56,
      bookmarked: true,
      hasLiked: true,
    },
    {
      id: 'p3',
      title: 'Icelandic waterfalls',
      excerpt: 'Skógafoss spray and rainbows.',
      images: [{ url: '/placeholder.svg', alt: 'Skógafoss waterfall' }],
      author: { id: 'u3', name: 'Lara Jensen', avatarUrl: null },
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      location: { name: 'South Coast, IS' },
      likeCount: 901,
      commentCount: 120,
      bookmarked: false,
      hasLiked: false,
    },
  ];

  const handleOpen = (postId: string) => {
    console.log('Open post', postId);
  };

  const handleShare = (postId: string) => {
    try {
      if (navigator.share) {
        navigator.share({ title: 'Trip', url: window.location.href });
      } else {
        console.log('Share post', postId);
      }
    } catch (e) {
      console.log('Share error', e);
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
      <RetroApp />
      <section className="container py-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Featured trips</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {samplePosts.map((p) => (
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
