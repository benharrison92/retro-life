import { useState } from 'react';
import { Plus, Folder, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCatalogues } from '@/hooks/useCatalogues';
import { Catalogue } from '@/lib/supabase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CatalogueManagerProps {
  onSelectCatalogue?: (catalogue: Catalogue) => void;
}

export const CatalogueManager = ({ onSelectCatalogue }: CatalogueManagerProps) => {
  const { catalogues, loading, createCatalogue, updateCatalogue, deleteCatalogue } = useCatalogues();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = async () => {
    if (formData.name.trim()) {
      await createCatalogue(formData.name.trim(), formData.description.trim() || undefined);
      setFormData({ name: '', description: '' });
      setIsCreateOpen(false);
    }
  };

  const handleEdit = async () => {
    if (editingCatalogue && formData.name.trim()) {
      await updateCatalogue(editingCatalogue.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      });
      setEditingCatalogue(null);
      setFormData({ name: '', description: '' });
    }
  };

  const handleDelete = async (catalogueId: string) => {
    await deleteCatalogue(catalogueId);
  };

  const openEditDialog = (catalogue: Catalogue) => {
    setEditingCatalogue(catalogue);
    setFormData({ name: catalogue.name, description: catalogue.description || '' });
  };

  if (loading) {
    return <div className="text-center py-8">Loading catalogues...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Catalogues</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Catalogue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Catalogue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter catalogue name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter catalogue description (optional)"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {catalogues.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No catalogues yet. Create your first catalogue to start saving items!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalogues.map((catalogue) => (
            <Card key={catalogue.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => onSelectCatalogue?.(catalogue)}>
                    <CardTitle className="text-lg">{catalogue.name}</CardTitle>
                    {catalogue.description && (
                      <p className="text-sm text-muted-foreground mt-1">{catalogue.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(catalogue)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Catalogue</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this catalogue? All saved items will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(catalogue.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCatalogue} onOpenChange={() => setEditingCatalogue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Catalogue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter catalogue name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter catalogue description (optional)"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingCatalogue(null)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={!formData.name.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};