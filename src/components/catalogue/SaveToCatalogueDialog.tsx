import { useState } from 'react';
import { BookmarkPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalogues, useCatalogueItems } from '@/hooks/useCatalogues';
import { RBTItem } from '@/lib/supabase';

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
      await addItemToCatalogue(
        catalogueId,
        retroId,
        item.id,
        itemType,
        item.text,
        item.tags,
        savedFromUserId,
        savedFromUserName
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
            {item.tags.length > 0 && (
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
                    {catalogues.map((catalogue) => (
                      <SelectItem key={catalogue.id} value={catalogue.id}>
                        {catalogue.name}
                      </SelectItem>
                    ))}
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