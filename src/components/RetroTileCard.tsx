import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Users, Calendar, UserCheck, Heart, Lightbulb, AlertTriangle } from "lucide-react";
import { Retrospective } from "@/lib/supabase";

interface RetroTileCardProps {
  retro: Retrospective;
  onClick: (retro: Retrospective) => void;
}

export const RetroTileCard = ({ retro, onClick }: RetroTileCardProps) => {
  const rosesCount = retro.roses?.length || 0;
  const budsCount = retro.buds?.length || 0;
  const thornsCount = retro.thorns?.length || 0;
  
  // Generate a vibrant color based on the retro title
  const getBackgroundColor = (title: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-indigo-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-orange-600',
      'bg-gradient-to-br from-emerald-500 to-green-600',
    ];
    
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
      onClick={() => onClick(retro)}
    >
      {/* Hero Section */}
      <div className="h-32 relative overflow-hidden">
        {retro.primaryPhotoUrl ? (
          <>
            <img 
              src={retro.primaryPhotoUrl} 
              alt={retro.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </>
        ) : (
          <>
            <div className={`${getBackgroundColor(retro.title)} w-full h-full`}></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </>
        )}
        <h3 className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white text-center px-4 drop-shadow-lg">
          {retro.title}
        </h3>
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Title and Date */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">{retro.title}</h4>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {retro.date}
          </div>
        </div>
        
        {/* Owner */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Owner:</span>
          <span className="font-medium">{retro.ownerName || 'Unknown'}</span>
        </div>
        
        {/* Attendees */}
        {retro.attendees && retro.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Attendees:</span>
            <span className="text-sm truncate">{retro.attendees.join(', ')}</span>
          </div>
        )}
        
        {/* Tagged Users */}
        {retro.attendeeUsers && retro.attendeeUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tagged:</span>
            <div className="flex items-center gap-1 overflow-hidden">
              {retro.attendeeUsers.slice(0, 3).map((attendeeUser, index) => (
                <Avatar key={attendeeUser.id} className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {attendeeUser.display_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {retro.attendeeUsers.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{retro.attendeeUsers.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* RBT Counts */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="font-medium">{rosesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{budsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{thornsCount}</span>
          </div>
        </div>
        
        {/* Event Type Badge */}
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="text-xs">
            {retro.event_type}
          </Badge>
          {retro.feedbackSpaceName && (
            <Badge variant="outline" className="text-xs">
              {retro.feedbackSpaceName}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};