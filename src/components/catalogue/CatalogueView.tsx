import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCatalogueItems } from '@/hooks/useCatalogues';
import { Catalogue } from '@/lib/supabase';

interface CatalogueViewProps {
  catalogue: Catalogue;
  onBack: () => void;
}

export const CatalogueView = ({ catalogue, onBack }: CatalogueViewProps) => {
  const { items, loading, removeItemFromCatalogue } = useCatalogueItems(catalogue.id);

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

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No items saved to this catalogue yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
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
              </CardHeader>
              <CardContent>
                <p className="mb-3">{item.item_text}</p>
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
    </div>
  );
};