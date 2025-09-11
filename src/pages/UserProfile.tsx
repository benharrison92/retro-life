import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import { supabase, UserProfile as UserProfileType, Retrospective, RBTItem } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from '@/components/AppHeader';
import { ParentRetroCard } from '@/components/ParentRetroCard';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [retros, setRetros] = useState<Retrospective[]>([]);
  const [parentRetros, setParentRetros] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && user) {
      loadUserData();
    }
  }, [userId, user]);

  const loadUserData = async () => {
    if (!userId || !user) return;

    setLoading(true);
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      setProfile(profileData);

      // Load user's public retrospectives that the current user can see
      const { data: retrosData, error: retrosError } = await supabase
        .from('retrospectives')
        .select(`
          *,
          user_profiles!retrospectives_user_id_fkey(display_name, avatar_url, email),
          retro_attendees(
            user_id,
            user_profiles(display_name, avatar_url, email)
          )
        `)
        .eq('user_id', userId)
        .eq('is_private', false)
        .order('date', { ascending: false });

      if (retrosError) {
        console.error('Error loading retros:', retrosError);
        return;
      }

      // Helper function to safely convert JSON arrays to RBTItem arrays
      const convertToRBTItems = (jsonData: any): RBTItem[] => {
        if (!Array.isArray(jsonData)) return [];
        return jsonData.filter(item => 
          item && typeof item === 'object' && 'id' in item && 'text' in item
        );
      };

      // Helper function to safely convert JSON arrays to photo arrays
      const convertToPhotos = (jsonData: any): any[] => {
        if (!Array.isArray(jsonData)) return [];
        return jsonData.filter(item => 
          item && typeof item === 'object'
        );
      };

      // Convert data to app format with proper type casting
      const convertedRetros: Retrospective[] = (retrosData || []).map(dbRetro => ({
        id: dbRetro.id,
        user_id: dbRetro.user_id,
        title: dbRetro.title,
        event_type: dbRetro.event_type,
        date: dbRetro.date,
        attendees: Array.isArray(dbRetro.attendees) ? dbRetro.attendees : [],
        roses: convertToRBTItems(dbRetro.roses),
        buds: convertToRBTItems(dbRetro.buds),
        thorns: convertToRBTItems(dbRetro.thorns),
        photos: convertToPhotos(dbRetro.photos),
        primaryPhotoUrl: dbRetro.primary_photo_url,
        location_name: dbRetro.location_name,
        city: dbRetro.city,
        state: dbRetro.state,
        country: dbRetro.country || 'US',
        latitude: dbRetro.latitude || undefined,
        longitude: dbRetro.longitude || undefined,
        parent_id: dbRetro.parent_id || undefined,
        feedback_space_id: dbRetro.feedback_space_id || undefined,
        is_private: dbRetro.is_private || false,
        created_at: dbRetro.created_at || '',
        updated_at: dbRetro.updated_at || '',
        place_id: dbRetro.place_id,
        place_name: dbRetro.place_name,
        place_address: dbRetro.place_address,
        place_rating: dbRetro.place_rating,
        place_user_ratings_total: dbRetro.place_user_ratings_total,
        place_types: dbRetro.place_types,
        place_photos: convertToPhotos(dbRetro.place_photos),
      }));

      setRetros(convertedRetros);
      
      // Separate parent retros (no parent_id) from sub-retros
      const parentRetrosFiltered = convertedRetros.filter(retro => !retro.parent_id);
      setParentRetros(parentRetrosFiltered);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetroOpen = (retroId: string) => {
    navigate(`/trip/${retroId}`);
  };

  const handleRetroShare = async (retroId: string) => {
    const shareUrl = `${window.location.origin}/trip/${retroId}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ 
          title: 'Check out this retrospective', 
          text: 'Take a look at this journey!',
          url: shareUrl 
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      try { 
        await navigator.clipboard.writeText(shareUrl); 
      } catch {}
    }
  };

  const getLocationString = (retro: Retrospective) => {
    const parts = [];
    if (retro.city) parts.push(retro.city);
    if (retro.state) parts.push(retro.state);
    if (retro.country) parts.push(retro.country);
    return parts.join(', ') || retro.location_name || '';
  };

  const getRBTCount = (retro: Retrospective) => {
    return (retro.roses?.length || 0) + (retro.buds?.length || 0) + (retro.thorns?.length || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <p className="text-muted-foreground">User not found or not accessible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container py-8 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{profile.display_name}</CardTitle>
                <p className="text-muted-foreground mt-1">{profile.email}</p>
                {profile.bio && (
                  <p className="text-foreground mt-2">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{retros.length} retrospective{retros.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{parentRetros.length} journey{parentRetros.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Journeys */}
        {parentRetros.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Journeys</h2>
            <div className="space-y-4">
              {parentRetros.map((retro) => (
                <ParentRetroCard
                  key={retro.id}
                  parentRetro={retro}
                  onOpen={handleRetroOpen}
                  onShare={handleRetroShare}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Retros */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">All Retrospectives</h2>
          {retros.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  {profile.display_name} hasn't shared any retrospectives yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {retros.map((retro) => (
                <Card 
                  key={retro.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleRetroOpen(retro.id)}
                >
                  <CardHeader className="pb-3">
                    {retro.primaryPhotoUrl && (
                      <div className="aspect-[16/10] w-full mb-3">
                        <img
                          src={retro.primaryPhotoUrl}
                          alt={retro.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <CardTitle className="text-lg">{retro.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{retro.date}</span>
                      {getLocationString(retro) && (
                        <>
                          <span>•</span>
                          <MapPin className="h-4 w-4" />
                          <span>{getLocationString(retro)}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{retro.event_type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {getRBTCount(retro)} insights
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}