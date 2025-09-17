import { useState } from 'react';
import { BookmarkPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalogues, useCatalogueItems } from '@/hooks/useCatalogues';
import { RBTItem, supabase } from '@/lib/supabase';

interface SaveToCatalogueDialogProps {
  retroId: string;
  item: RBTItem;
  itemType: 'rose' | 'bud' | 'thorn';
  savedFromUserId: string;
  savedFromUserName: string;
  children: React.ReactNode;
}

export const SaveToCatalogueDialog = ({
  retroId,
  item,
  itemType,
  savedFromUserId,
  savedFromUserName,
  children
}: SaveToCatalogueDialogProps) => {
  const { catalogues, createCatalogue } = useCatalogues();
  const { addItemToCatalogue } = useCatalogueItems();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCatalogueName, setNewCatalogueName] = useState('');
  const [newCatalogueDescription, setNewCatalogueDescription] = useState('');

  const handleSave = async () => {
    let catalogueId = selectedCatalogueId;

    // If creating a new catalogue, create it first
    if (isCreatingNew && newCatalogueName.trim()) {
      const newCatalogue = await createCatalogue(
        newCatalogueName.trim(),
        newCatalogueDescription.trim() || undefined
      );
      if (!newCatalogue) return;
      catalogueId = newCatalogue.id;
    }

    if (catalogueId) {
      // Determine place data to save: prefer item-level, fallback to retro-level
      let placeDataToSave:
        | {
            place_id?: string;
            place_name?: string;
            place_address?: string;
            place_rating?: number;
            place_user_ratings_total?: number;
            place_types?: string[];
          }
        | undefined;

      if (item.place_name) {
        placeDataToSave = {
          place_id: item.place_id,
          place_name: item.place_name,
          place_address: item.place_address,
          place_rating: item.place_rating,
          place_user_ratings_total: item.place_user_ratings_total,
          place_types: item.place_types,
        };
      } else {
        const { data: retro, error } = await supabase
          .from('retrospectives')
          .select(
            'place_id, place_name, place_address, place_rating, place_user_ratings_total, place_types'
          )
          .eq('id', retroId)
          .maybeSingle();

        if (error) {
          console.error('SaveToCatalogueDialog: Failed to fetch retro place data', error);
        }
        if (retro?.place_name) {
          placeDataToSave = {
            place_id: retro.place_id as string | undefined,
            place_name: retro.place_name as string | undefined,
            place_address: retro.place_address as string | undefined,
            place_rating: (retro.place_rating as number | null) ?? undefined,
            place_user_ratings_total: (retro.place_user_ratings_total as number | null) ?? undefined,
            place_types: (retro.place_types as string[] | null) ?? undefined,
          };
        }
      }

      console.log('Saving item to catalogue with place data:', {
        item,
        placeData: placeDataToSave ?? 'No place data',
      });

      await addItemToCatalogue(
        catalogueId,
        retroId,
        item.id,
        itemType,
        item.text,
        item.tags || [],
        savedFromUserId,
        savedFromUserName,
        placeDataToSave
      );

      // Reset and close
      setSelectedCatalogueId('');
      setIsCreatingNew(false);
      setNewCatalogueName('');
      setNewCatalogueDescription('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Catalogue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-1">
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
            </div>
            <div className="text-sm">{item.text}</div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              From: {savedFromUserName}
            </div>
          </div>

          {!isCreatingNew ? (
            <div className="space-y-3">
              <div>
                <Label>Select Catalogue</Label>
                <Select value={selectedCatalogueId} onValueChange={setSelectedCatalogueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a catalogue" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogues && catalogues.length > 0 ? (
                      catalogues.map((catalogue) => (
                        <SelectItem key={catalogue.id} value={catalogue.id}>
                          {catalogue.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No catalogues available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreatingNew(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Catalogue
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-name">Catalogue Name</Label>
                <Input
                  id="new-name"
                  value={newCatalogueName}
                  onChange={(e) => setNewCatalogueName(e.target.value)}
                  placeholder="Enter catalogue name"
                />
              </div>
              <div>
                <Label htmlFor="new-description">Description (optional)</Label>
                <Textarea
                  id="new-description"
                  value={newCatalogueDescription}
                  onChange={(e) => setNewCatalogueDescription(e.target.value)}
                  placeholder="Enter catalogue description"
                  rows={2}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreatingNew(false)}
              >
                Use Existing Catalogue
              </Button>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedCatalogueId && (!isCreatingNew || !newCatalogueName.trim())}
            >
              <BookmarkPlus className="h-4 w-4 mr-2" />
              Save to Catalogue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};