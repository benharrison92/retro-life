import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, MapPin, Calendar, Users } from 'lucide-react';
import { Retrospective } from '@/lib/supabase';
import { useRetros } from '@/hooks/useRetros';
import { useNavigate } from 'react-router-dom';

interface ParentRetroCardProps {
  parentRetro: Retrospective;
  onOpen: (id: string) => void;
  onShare: (id: string) => void;
}

export const ParentRetroCard = ({ parentRetro, onOpen, onShare }: ParentRetroCardProps) => {
  const [showChildren, setShowChildren] = useState(false);
  const [childRetros, setChildRetros] = useState<Retrospective[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const { fetchChildRetros } = useRetros();
  const navigate = useNavigate();

  const toggleChildren = async () => {
    if (!showChildren && childRetros.length === 0) {
      setLoadingChildren(true);
      const children = await fetchChildRetros(parentRetro.id);
      setChildRetros(children);
      setLoadingChildren(false);
    }
    setShowChildren(!showChildren);
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div 
        className="cursor-pointer"
        onClick={() => onOpen(parentRetro.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                {parentRetro.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{parentRetro.date}</span>
                </div>
                {getLocationString(parentRetro) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocationString(parentRetro)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{(parentRetro.attendeeUsers?.length || 0) + 1}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {parentRetro.event_type} • {getRBTCount(parentRetro)} insights
              </Badge>
            </div>
            {parentRetro.primaryPhotoUrl && (
              <div className="ml-4">
                <img 
                  src={parentRetro.primaryPhotoUrl} 
                  alt={parentRetro.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
      </div>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleChildren();
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            {showChildren ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {loadingChildren ? 'Loading...' : `${childRetros.length} sub-retros`}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShare(parentRetro.id);
              }}
            >
              Share
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(parentRetro.id);
              }}
            >
              View
            </Button>
          </div>
        </div>

        {showChildren && (
          <div className="mt-4 space-y-2 border-t pt-4">
            {childRetros.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/trip/${child.id}`);
                }}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{child.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{child.date}</span>
                    {getLocationString(child) && (
                      <>
                        <span>•</span>
                        <span>{getLocationString(child)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{getRBTCount(child)} insights</span>
                  </div>
                </div>
                {child.primaryPhotoUrl && (
                  <img 
                    src={child.primaryPhotoUrl} 
                    alt={child.title}
                    className="w-10 h-10 rounded object-cover ml-3"
                  />
                )}
              </div>
            ))}
            {childRetros.length === 0 && !loadingChildren && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No sub-retrospectives yet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};