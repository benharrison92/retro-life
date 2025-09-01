import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, EyeOff, Users, Globe, Network } from 'lucide-react';
import { useRetros } from '@/hooks/useRetros';
import { useToast } from '@/hooks/use-toast';

interface SaveAsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  retroId: string;
  retroTitle: string;
  mode: 'featured' | 'child';
}

export const SaveAsDialog: React.FC<SaveAsDialogProps> = ({
  isOpen,
  onClose,
  retroId,
  retroTitle,
  mode
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { retros, makeRetroPublic, assignParentRetro } = useRetros();
  const { toast } = useToast();

  // Get potential parent retros (exclude self and children)
  const potentialParents = retros.filter(r => 
    r.id !== retroId && 
    (r as any).parent_id !== retroId // Don't show children as potential parents
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === 'featured') {
        await makeRetroPublic(retroId);
        toast({
          title: "Success",
          description: `"${retroTitle}" is now a featured public retrospective!`,
        });
      } else if (mode === 'child' && selectedParentId) {
        await assignParentRetro(retroId, selectedParentId);
        const parentTitle = retros.find(r => r.id === selectedParentId)?.title || 'parent';
        toast({
          title: "Success", 
          description: `"${retroTitle}" is now a sub-retrospective of "${parentTitle}"`,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSelectedParentId('');
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetDialog();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'featured' ? (
              <>
                <Globe className="h-5 w-5" />
                Make Featured Retro
              </>
            ) : (
              <>
                <Network className="h-5 w-5" />
                Add as Sub-Retro
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Current Retrospective:</p>
            <p className="text-sm text-muted-foreground mt-1">"{retroTitle}"</p>
          </div>

          {mode === 'featured' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>This will make your retrospective publicly visible in the featured section</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Featured retrospectives appear on the homepage and can be discovered by other users.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="parent-select">Select Parent Retrospective:</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger id="parent-select">
                  <SelectValue placeholder="Choose a parent retrospective..." />
                </SelectTrigger>
                <SelectContent>
                  {potentialParents.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No retrospectives available as parents
                    </div>
                  ) : (
                    potentialParents.map((retro) => (
                      <SelectItem key={retro.id} value={retro.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{retro.title}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {retro.event_type}
                            </Badge>
                            {(retro as any).is_private ? (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Users className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {selectedParentId && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    This retrospective will become a sub-item that can be accessed from the parent's detail page.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || (mode === 'child' && !selectedParentId)}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'featured' ? 'Make Featured' : 'Add as Sub-Retro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};