import React, { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import Map from '@/components/Map';
import { RetroMapCard } from '@/components/RetroMapCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Globe } from 'lucide-react';

interface RetroLocation {
  id: string;
  title: string;
  event_type: string;
  date: string;
  latitude: number;
  longitude: number;
  location_name: string;
  city?: string;
  state?: string;
  country?: string;
  roses: any;
  buds: any;
  thorns: any;
  photos: any;
  primary_photo_url?: string;
  user_profiles: {
    display_name: string;
  };
}

export default function MapExplore() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retros, setRetros] = useState<RetroLocation[]>([]);
  const [selectedRetro, setSelectedRetro] = useState<RetroLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    fetchPublicRetros();
    geocodeExistingRetros();
  }, []);

  const fetchPublicRetros = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('retrospectives')
        .select(`
          id,
          title,
          event_type,
          date,
          latitude,
          longitude,
          location_name,
          city,
          state,
          country,
          roses,
          buds,
          thorns,
          photos,
          primary_photo_url,
          user_profiles!user_id(display_name)
        `)
        .eq('is_private', false)
        .order('date', { ascending: false })
        .limit(200);

      if (error) throw error;
      
      // Transform the data to ensure arrays
      const transformedData = (data || []).map(retro => ({
        ...retro,
        roses: Array.isArray(retro.roses) ? retro.roses : [],
        buds: Array.isArray(retro.buds) ? retro.buds : [],
        thorns: Array.isArray(retro.thorns) ? retro.thorns : [],
        photos: Array.isArray(retro.photos) ? retro.photos : []
      }));
      
      // Filter retros that have coordinates
      const retrosWithCoords = transformedData.filter(retro => 
        retro.latitude !== null && retro.longitude !== null
      );
      
      setRetros(retrosWithCoords);
    } catch (error) {
      console.error('Error fetching retros:', error);
      toast({
        title: "Error",
        description: "Failed to load retros. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const geocodeExistingRetros = async () => {
    if (!user) {
      console.log('No user logged in, skipping geocoding');
      return;
    }

    setIsGeocoding(true);
    console.log('Starting geocoding process...');

    try {
      // Fetch user's retros without coordinates
      const { data: userRetros, error } = await supabase
        .from('retrospectives')
        .select('id, location_name, city, state, country, latitude, longitude')
        .eq('user_id', user.id)
        .or('latitude.is.null,longitude.is.null')
        .not('location_name', 'is', null);

      if (error) {
        console.error('Error fetching retros for geocoding:', error);
        throw error;
      }

      console.log(`Found ${userRetros?.length || 0} retros to geocode:`, userRetros);

      // Geocode each retro
      for (const retro of userRetros || []) {
        console.log(`Geocoding: ${retro.location_name}`);
        await geocodeAndUpdateRetro(retro);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Geocoding complete, refreshing map...');
      // Refresh the map after geocoding
      await fetchPublicRetros();
      
      toast({
        title: "Geocoding Complete",
        description: `Updated coordinates for ${userRetros?.length || 0} retros.`,
      });
    } catch (error) {
      console.error('Error geocoding retros:', error);
      toast({
        title: "Geocoding Error",
        description: "Failed to update some retro coordinates.",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const geocodeAndUpdateRetro = async (retro: any) => {
    try {
      const query = [retro.location_name, retro.city, retro.state, retro.country]
        .filter(Boolean)
        .join(', ');

      if (!query) {
        console.log(`No query string for retro ${retro.id}`);
        return;
      }

      console.log(`Geocoding query: "${query}"`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const results = await response.json();
      console.log(`Geocoding results for "${query}":`, results);

      if (results.length > 0) {
        const result = results[0];
        const latitude = parseFloat(result.lat);
        const longitude = parseFloat(result.lon);
        
        console.log(`Updating retro ${retro.id} with coordinates: ${latitude}, ${longitude}`);
        
        const { error } = await supabase
          .from('retrospectives')
          .update({
            latitude: latitude,
            longitude: longitude,
            city: result.address?.city || result.address?.town || result.address?.village || retro.city,
            state: result.address?.state || retro.state,
            country: result.address?.country || retro.country
          })
          .eq('id', retro.id);

        if (error) {
          console.error(`Error updating retro ${retro.id}:`, error);
        } else {
          console.log(`✅ Successfully updated coordinates for ${retro.location_name}`);
        }
      } else {
        console.log(`No geocoding results found for "${query}"`);
      }
    } catch (error) {
      console.error(`Error geocoding retro ${retro.location_name}:`, error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const result = results[0];
        setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocation(searchQuery);
  };

  const handleMarkerClick = (retro: RetroLocation) => {
    setSelectedRetro(retro);
    setMapCenter([retro.latitude, retro.longitude]);
  };

  const handleSaveToCollection = () => {
    if (!selectedRetro) return;
    
    toast({
      title: "Feature coming soon",
      description: "Saving retros to catalogues will be available soon!",
    });
  };

  const handleLikeRetro = async (retroId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like retros.",
        variant: "destructive",
      });
      return;
    }

    // This would need a likes table in the database
    toast({
      title: "Feature coming soon",
      description: "Liking retros will be available soon!",
    });
  };

  const mapMarkers = retros.map(retro => ({
    lat: retro.latitude,
    lng: retro.longitude,
    label: `<strong>${retro.title}</strong><br/>${retro.location_name}<br/><em>Click to view details</em>`,
    data: retro
  }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Globe className="h-8 w-8" />
            Explore Retros Around the World
          </h1>
          <p className="text-muted-foreground">
            Discover retrospectives shared by our community from amazing places around the globe
          </p>
          {user && (
            <p className="text-sm text-blue-600">
              🔄 Automatically adding coordinates to your retros for better discovery...
            </p>
          )}
        </div>

        {/* Search and Geocoding Controls */}
        <div className="flex gap-2 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location to explore..."
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          {user && (
            <Button 
              variant="outline" 
              onClick={geocodeExistingRetros}
              disabled={isGeocoding}
            >
              {isGeocoding ? 'Adding...' : 'Add My Retros'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="h-[600px] border rounded-lg overflow-hidden">
              {!isLoading ? (
                <Map
                  center={mapCenter}
                  zoom={6}
                  markers={mapMarkers}
                  onMarkerClick={(retroData) => {
                    handleMarkerClick(retroData);
                  }}
                  onLocationSelect={(lat, lng) => {
                    // Fallback for map clicks without markers
                    const nearbyRetro = retros.find(retro => 
                      Math.abs(retro.latitude - lat) < 0.01 && 
                      Math.abs(retro.longitude - lng) < 0.01
                    );
                    if (nearbyRetro) {
                      handleMarkerClick(nearbyRetro);
                    }
                  }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <p>Loading retros...</p>
                </div>
              )}
            </div>
          </div>

          {/* Retro Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {selectedRetro ? 'Selected Retro' : 'Select a retro on the map'}
            </h2>
            
            {selectedRetro ? (
              <RetroMapCard
                retro={selectedRetro}
                onSave={handleSaveToCollection}
                onLike={() => handleLikeRetro(selectedRetro.id)}
                currentUser={user}
              />
            ) : (
              <div className="text-center p-6 border rounded-lg bg-muted/50">
                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click on any marker on the map to view the retro details
                </p>
              </div>
            )}

            {/* Recent Retros List */}
            <div className="space-y-2">
              <h3 className="font-medium">Recent Retros</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {retros.slice(0, 10).map(retro => (
                  <button
                    key={retro.id}
                    onClick={() => handleMarkerClick(retro)}
                    className="w-full text-left p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{retro.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {retro.location_name} • {new Date(retro.date).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}