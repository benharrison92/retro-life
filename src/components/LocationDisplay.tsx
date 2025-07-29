import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Compass } from "lucide-react";

interface LocationBadgeProps {
  locationName?: string;
  city?: string;
  state?: string;
  country?: string;
  variant?: "default" | "outline" | "secondary";
  showIcon?: boolean;
  className?: string;
}

export const LocationBadge = ({ 
  locationName, 
  city, 
  state, 
  country, 
  variant = "outline", 
  showIcon = true,
  className = "" 
}: LocationBadgeProps) => {
  const getLocationDisplay = () => {
    if (locationName && city && state) {
      return `${locationName}, ${city}, ${state}`;
    } else if (city && state) {
      return `${city}, ${state}`;
    } else if (locationName) {
      return locationName;
    } else if (city) {
      return city;
    }
    return null;
  };

  const locationDisplay = getLocationDisplay();

  if (!locationDisplay) return null;

  return (
    <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
      {showIcon && <MapPin className="w-3 h-3" />}
      {locationDisplay}
    </Badge>
  );
};

interface LocationInfoProps {
  locationName?: string;
  city?: string;
  state?: string;
  country?: string;
  showDistance?: boolean;
  distance?: number;
  className?: string;
}

export const LocationInfo = ({ 
  locationName, 
  city, 
  state, 
  country, 
  showDistance, 
  distance,
  className = "" 
}: LocationInfoProps) => {
  const getLocationDisplay = () => {
    if (locationName && city && state) {
      return `${locationName}, ${city}, ${state}`;
    } else if (city && state) {
      return `${city}, ${state}`;
    } else if (locationName) {
      return locationName;
    } else if (city) {
      return city;
    }
    return null;
  };

  const locationDisplay = getLocationDisplay();

  if (!locationDisplay) return null;

  return (
    <div className={`flex items-center gap-2 text-primary ${className}`}>
      <Navigation className="w-4 h-4" />
      <div className="flex items-center gap-2">
        <span className="font-medium">Location:</span>
        <span>{locationDisplay}</span>
        {showDistance && distance !== undefined && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Compass className="w-3 h-3" />
            {distance < 1 ? `${Math.round(distance * 100)}m` : `${distance.toFixed(1)}mi`}
          </Badge>
        )}
      </div>
    </div>
  );
};