import { useState } from 'react';
import { ArrowLeft, Trash2, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCatalogueItems } from '@/hooks/useCatalogues';
import { CatalogueMembersDialog } from './CatalogueMembersDialog';
import { CatalogueItemDiscussion } from './CatalogueItemDiscussion';
import { Catalogue, CatalogueItem } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface CatalogueViewProps {
  catalogue: Catalogue;
  onBack: () => void;
}

export const CatalogueView = ({ catalogue, onBack }: CatalogueViewProps) => {
  const { items, loading, removeItemFromCatalogue } = useCatalogueItems(catalogue.id);
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
  
  const isOwner = user?.id === catalogue.user_id;

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'rose': return 'bg-green-100 text-green-800';
      case 'bud': return 'bg-yellow-100 text-yellow-800';
      case 'thorn': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'rose': return '🌹';
      case 'bud': return '🌱';
      case 'thorn': return '🌿';
      default: return '•';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading catalogue items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalogues
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{catalogue.name}</h2>
            {catalogue.description && (
              <p className="text-muted-foreground">{catalogue.description}</p>
            )}
          </div>
        </div>
        
        <CatalogueMembersDialog
          catalogueId={catalogue.id}
          catalogueName={catalogue.name}
          isOwner={isOwner}
        />
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No items saved to this catalogue yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getItemTypeIcon(item.item_type)}</span>
                    <div>
                      <Badge className={getItemTypeColor(item.item_type)}>
                        {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        From: {item.saved_from_user_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this item from your catalogue?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeItemFromCatalogue(item.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => setSelectedItem(item)}>
                <p className="mb-3">{item.item_text}</p>
                
                {/* Location display */}
                {item.place_name && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-xs mb-3 w-full justify-start hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        let mapsUrl;
                        if (item.place_id) {
                          mapsUrl = `https://maps.google.com/?cid=${item.place_id}`;
                        } else {
                          const query = encodeURIComponent(`${item.place_name} ${item.place_address || ''}`);
                          mapsUrl = `https://maps.google.com/?q=${query}`;
                        }
                        const newWindow = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
                        if (!newWindow) {
                          navigator.clipboard?.writeText(mapsUrl);
                          alert('Link copied to clipboard! Paste it in your browser to view the location.');
                        }
                      } catch (error) {
                        console.error('Error opening Google Maps:', error);
                        const locationText = `${item.place_name} ${item.place_address || ''}`;
                        navigator.clipboard?.writeText(locationText);
                        alert('Location copied to clipboard!');
                      }
                    }}
                  >
                    <MapPin className="w-3 h-3 mr-2 text-blue-600" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">{item.place_name}</div>
                      {item.place_address && (
                        <div className="text-muted-foreground text-xs truncate">{item.place_address}</div>
                      )}
                      {item.place_rating && (
                        <div className="text-muted-foreground text-xs">⭐ {item.place_rating}/5</div>
                      )}
                    </div>
                  </Button>
                )}

                {item.item_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.item_tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Discussion Dialog */}
      {selectedItem && (
        <CatalogueItemDiscussion
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};