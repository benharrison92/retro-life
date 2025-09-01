import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, MapPin, Calendar, Users, Eye, EyeOff, Globe } from 'lucide-react';
import { RetroNode, useRetroNodes } from '@/hooks/useRetroNodes';
import { NodeCard } from './NodeCard';
import { RBTEditor } from './RBTEditor';
import { format } from 'date-fns';

interface TripOverviewProps {
  trip: RetroNode;
  onAddCategory?: () => void;
  onEditTrip?: () => void;
  onAddCity?: (categoryId: string) => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({
  trip,
  onAddCategory,
  onEditTrip,
  onAddCity
}) => {
  const [selectedNode, setSelectedNode] = useState<RetroNode | null>(null);
  const [rbtEditorOpen, setRbtEditorOpen] = useState(false);
  
  const categories = trip.children || [];
  
  const getCategoryStats = (category: RetroNode) => {
    const cities = category.children || [];
    const totalVenues = cities.reduce((acc, city) => acc + (city.children?.length || 0), 0);
    return { cities: cities.length, venues: totalVenues };
  };

  const handleOpenRBT = (node: RetroNode) => {
    setSelectedNode(node);
    setRbtEditorOpen(true);
  };

  const getVisibilityIcon = (visibility: RetroNode['visibility']) => {
    switch (visibility) {
      case 'PUBLIC': return Globe;
      case 'FRIENDS': return Users;
      case 'PRIVATE': return EyeOff;
      default: return EyeOff;
    }
  };

  const VisibilityIcon = getVisibilityIcon(trip.visibility);

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-primary-foreground rounded-full">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{trip.title}</CardTitle>
                {trip.subtitle && (
                  <p className="text-muted-foreground mt-1">{trip.subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <VisibilityIcon className="h-3 w-3" />
                {trip.visibility.toLowerCase()}
              </Badge>
              {onEditTrip && (
                <Button variant="outline" onClick={onEditTrip}>
                  Edit Trip
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {(trip.start_date || trip.end_date) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {trip.start_date && format(new Date(trip.start_date), 'MMM dd, yyyy')}
                  {trip.start_date && trip.end_date && ' - '}
                  {trip.end_date && format(new Date(trip.end_date), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>{categories.length} categories</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={() => handleOpenRBT(trip)}>
              Trip RBT Entries
            </Button>
            {onAddCategory && (
              <Button variant="outline" onClick={onAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Categories Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No categories yet. Start organizing your trip by adding categories like Transportation, Accommodation, or Activities.
              </p>
              {onAddCategory && (
                <Button onClick={onAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const stats = getCategoryStats(category);
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    {category.subtitle && (
                      <p className="text-sm text-muted-foreground">{category.subtitle}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{stats.cities} cities</span>
                      <span>{stats.venues} venues</span>
                    </div>
                    
                    <Separator className="mb-3" />
                    
                    {/* Cities Preview */}
                    {category.children && category.children.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Cities:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.children.slice(0, 3).map((city) => (
                            <Badge key={city.id} variant="secondary" className="text-xs">
                              {city.title}
                            </Badge>
                          ))}
                          {category.children.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.children.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenRBT(category)}
                        className="flex-1"
                      >
                        RBT
                      </Button>
                      {onAddCity && (
                        <Button
                          size="sm"
                          onClick={() => onAddCity(category.id)}
                          className="flex-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          City
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* RBT Editor */}
      <RBTEditor
        node={selectedNode}
        isOpen={rbtEditorOpen}
        onClose={() => {
          setRbtEditorOpen(false);
          setSelectedNode(null);
        }}
      />
    </div>
  );
};