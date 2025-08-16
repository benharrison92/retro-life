import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Heart, Bookmark, Calendar, User } from 'lucide-react';

interface RetroMapCardProps {
  retro: {
    id: string;
    title: string;
    event_type: string;
    date: string;
    location_name: string;
    city?: string;
    state?: string;
    country?: string;
    roses: any;
    buds: any;
    thorns: any;
    primary_photo_url?: string;
    user_profiles: {
      display_name: string;
    };
  };
  onSave: () => void;
  onLike: () => void;
  onOpenFull?: () => void;
  currentUser?: any;
}

export function RetroMapCard({ retro, onSave, onLike, onOpenFull, currentUser }: RetroMapCardProps) {
  const roses = Array.isArray(retro.roses) ? retro.roses : [];
  const buds = Array.isArray(retro.buds) ? retro.buds : [];
  const thorns = Array.isArray(retro.thorns) ? retro.thorns : [];
  const totalItems = roses.length + buds.length + thorns.length;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{retro.title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {retro.event_type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{retro.user_profiles.display_name}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Photo */}
        {retro.primary_photo_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={retro.primary_photo_url}
              alt={retro.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{retro.location_name}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(retro.date).toLocaleDateString()}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-red-50 dark:bg-red-950 rounded">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {roses.length}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">Roses</p>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {buds.length}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">Buds</p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {thorns.length}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Thorns</p>
          </div>
        </div>

        {/* Preview Content */}
        {roses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Top Rose:</h4>
            <p className="text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
              {roses[0].text}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={onOpenFull}
          className="w-full"
          size="sm"
        >
          Open Full View
        </Button>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onLike}
            className="flex-1"
            disabled={!currentUser}
          >
            <Heart className="h-4 w-4 mr-2" />
            Like
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="flex-1"
            disabled={!currentUser}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}