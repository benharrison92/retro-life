import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Search } from 'lucide-react';
import Map from './Map';

interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for a location..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);

  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setMapCenter([value.latitude, value.longitude]);
    }
  }, [value]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        searchLocation(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleLocationSelect(searchResults[0]);
    }
  };

  const handleLocationSelect = (result: NominatimResult) => {
    const locationData: LocationData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      locationName: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state,
      country: result.address?.country
    };
    
    setSelectedLocation(locationData);
    setMapCenter([locationData.latitude, locationData.longitude]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const result = await response.json();
      
      const locationData: LocationData = {
        latitude: lat,
        longitude: lng,
        locationName: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state,
        country: result.address?.country
      };
      
      setSelectedLocation(locationData);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSave = () => {
    if (selectedLocation) {
      onChange(selectedLocation);
      setOpen(false);
    }
  };

  const displayValue = value?.locationName || placeholder;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="truncate">{displayValue}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location (e.g., Yosemite National Park)"
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg p-2 max-h-32 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(result)}
                  className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}

          {/* Map */}
          <div className="h-96">
            <Map
              center={mapCenter}
              zoom={selectedLocation ? 13 : 10}
              markers={selectedLocation ? [{
                lat: selectedLocation.latitude,
                lng: selectedLocation.longitude,
                label: selectedLocation.locationName
              }] : []}
              onLocationSelect={handleMapClick}
              className="w-full h-full"
            />
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">Selected Location:</p>
              <p className="text-sm text-muted-foreground">{selectedLocation.locationName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lat: {selectedLocation.latitude.toFixed(6)}, 
                Lng: {selectedLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedLocation}>
              Save Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;