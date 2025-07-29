import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RetroApp } from "@/components/RetroApp";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
  return <RetroApp />;
};

export default Index;
