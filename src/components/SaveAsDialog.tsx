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
  mode: 'featured' | 'child' | 'make_child';
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

  // Get potential parent retros (exclude self and children) for child mode
  // Get potential child retros (exclude self and current children) for make_child mode
  const potentialRetros = mode === 'child' 
    ? retros.filter(r => 
        r.id !== retroId && 
        (r as any).parent_id !== retroId // Don't show children as potential parents
      )
    : retros.filter(r => 
        r.id !== retroId && 
        (r as any).parent_id !== retroId && // Don't show existing children
        !(r as any).parent_id // Don't show retros that already have a parent
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
      } else if (mode === 'make_child' && selectedParentId) {
        await assignParentRetro(selectedParentId, retroId);
        const childTitle = retros.find(r => r.id === selectedParentId)?.title || 'retro';
        toast({
          title: "Success", 
          description: `"${childTitle}" is now a sub-retrospective of "${retroTitle}"`,
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
            ) : mode === 'child' ? (
              <>
                <Network className="h-5 w-5" />
                Add as Sub-Retro
              </>
            ) : (
              <>
                <Network className="h-5 w-5" />
                Add Sub-Retrospective
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
              <Label htmlFor="parent-select">
                {mode === 'child' ? 'Select Parent Retrospective:' : 'Select Retrospective to Make Sub-Item:'}
              </Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger id="parent-select">
                  <SelectValue placeholder={mode === 'child' ? "Choose a parent retrospective..." : "Choose a retrospective to make a sub-item..."} />
                </SelectTrigger>
                <SelectContent>
                  {potentialRetros.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      {mode === 'child' ? 'No retrospectives available as parents' : 'No retrospectives available to make sub-items'}
                    </div>
                  ) : (
                    potentialRetros.map((retro) => (
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
                    {mode === 'child' 
                      ? 'This retrospective will become a sub-item that can be accessed from the parent\'s detail page.'
                      : 'The selected retrospective will become a sub-item that can be accessed from this retrospective\'s detail page.'
                    }
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
            disabled={loading || ((mode === 'child' || mode === 'make_child') && !selectedParentId)}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'featured' ? 'Make Featured' : mode === 'child' ? 'Add as Sub-Retro' : 'Add Sub-Retro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};