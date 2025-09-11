import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PlaceData {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
}

interface PlaceSearchProps {
  value?: PlaceData | null;
  onChange?: (place: PlaceData | null) => void;
  onPlaceSelect?: (place: PlaceData) => void;
  placeholder?: string;
  currentLocation?: { lat: number; lng: number };
  className?: string;
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Search for a restaurant or place...",
  currentLocation,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(value || null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPlaces(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, currentLocation]);

  const searchPlaces = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places-search', {
        body: { 
          query,
          location: currentLocation
        }
      });

      if (error) {
        console.error('Places search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search places. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setSearchResults(data.places || []);
    } catch (error) {
      console.error('Error searching places:', error);
      toast({
        title: "Search Error", 
        description: "Failed to search places. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = (place: PlaceData) => {
    setSelectedPlace(place);
    // If onPlaceSelect is provided, call it immediately (for inline usage)
    if (onPlaceSelect) {
      onPlaceSelect(place);
      setIsOpen(false);
    }
  };

  const handleSave = () => {
    if (onChange && selectedPlace) {
      onChange(selectedPlace);
    }
    setIsOpen(false);
  };

  const formatTypes = (types: string[]) => {
    const relevantTypes = types.filter(type => 
      !['establishment', 'point_of_interest'].includes(type)
    ).slice(0, 2);
    
    return relevantTypes.map(type => 
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const displayText = value?.name || placeholder;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`w-full justify-start text-left ${className || ''}`}>
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{displayText}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Place</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {selectedPlace && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{selectedPlace.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPlace.formatted_address}</p>
                    <div className="flex items-center gap-2">
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{selectedPlace.rating}</span>
                        </div>
                      )}
                      {selectedPlace.user_ratings_total && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-xs">{selectedPlace.user_ratings_total} reviews</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formatTypes(selectedPlace.types).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Selected</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((place) => (
              <Card 
                key={place.place_id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedPlace?.place_id === place.place_id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePlaceSelect(place)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{place.name}</h3>
                      <div className="flex items-center gap-2">
                        {place.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{place.rating}</span>
                          </div>
                        )}
                        {place.user_ratings_total && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-xs">{place.user_ratings_total}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{place.formatted_address}</p>
                    <div className="flex flex-wrap gap-1">
                      {formatTypes(place.types).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchQuery && !isLoading && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No places found for "{searchQuery}"
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedPlace}>
              Save Place
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};