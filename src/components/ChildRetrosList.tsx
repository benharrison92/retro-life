import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ChildRetro {
  id: string;
  title: string;
  event_type: string;
  date: string;
  location_name?: string;
  city?: string;
  state?: string;
  roses: any;
  buds: any;
  thorns: any;
  created_at: string;
}

interface ChildRetrosListProps {
  parentRetroId: string;
  onAddChild?: () => void;
}

export const ChildRetrosList: React.FC<ChildRetrosListProps> = ({
  parentRetroId,
  onAddChild
}) => {
  const [childRetros, setChildRetros] = useState<ChildRetro[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildRetros = async () => {
      try {
        const { data, error } = await supabase
          .from('retrospectives')
          .select('*')
          .eq('parent_id', parentRetroId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching child retros:', error);
          return;
        }

        setChildRetros(data || []);
      } catch (error) {
        console.error('Error fetching child retros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildRetros();
  }, [parentRetroId]);

  const getRBTCount = (retro: ChildRetro) => {
    const roses = Array.isArray(retro.roses) ? retro.roses.length : 0;
    const buds = Array.isArray(retro.buds) ? retro.buds.length : 0;
    const thorns = Array.isArray(retro.thorns) ? retro.thorns.length : 0;
    return roses + buds + thorns;
  };

  const getLocationString = (retro: ChildRetro) => {
    return retro.location_name || retro.city || retro.state || '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Sub-Retrospectives</h3>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sub-Retrospectives</h3>
        {onAddChild && (
          <Button variant="outline" size="sm" onClick={onAddChild}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-Retro
          </Button>
        )}
      </div>

      {childRetros.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No sub-retrospectives yet. Break down your experience into smaller, focused retros.
            </p>
            {onAddChild && (
              <Button variant="outline" onClick={onAddChild}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Sub-Retro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {childRetros.map((retro) => (
            <Card 
              key={retro.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/trip/${retro.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {retro.title}
                  </CardTitle>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <Badge variant="secondary" className="w-fit text-xs">
                  {retro.event_type}
                </Badge>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(retro.date), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {getLocationString(retro) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{getLocationString(retro)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs">
                      {getRBTCount(retro)} RBT entries
                    </span>
                    <span className="text-xs">
                      {format(new Date(retro.created_at), 'MMM dd')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};