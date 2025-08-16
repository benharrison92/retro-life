import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
  data?: any; // Additional data that can be passed with the marker
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: LocationPoint[];
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerClick?: (data: any) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({ 
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 10,
  markers = [],
  onLocationSelect,
  onMarkerClick,
  className = "w-full h-96 rounded-lg"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    
    // Get Mapbox token from Supabase Edge Function
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error getting Mapbox token:', error);
      }
    };
    
    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !isClient || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [center[1], center[0]], // Mapbox uses lng, lat
      zoom: zoom,
    });

    // Add click handler
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        onLocationSelect(e.lngLat.lat, e.lngLat.lng);
      });
    }

    // Add markers
    markers.forEach((marker, index) => {
      const el = document.createElement('div');
      el.className = 'w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform';
      
      const popup = marker.label ? new mapboxgl.Popup().setHTML(marker.label) : undefined;
      
      const markerInstance = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click handler for marker
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (marker.data && onMarkerClick) {
          onMarkerClick(marker.data);
        } else if (onLocationSelect) {
          onLocationSelect(marker.lat, marker.lng);
        }
      });
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [center, zoom, markers, onLocationSelect, isClient, mapboxToken]);

  if (!isClient) {
    return (
      <div className={className}>
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
          Loading map...
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className={className}>
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
          Please configure Mapbox token in Supabase Edge Function Secrets
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default Map;