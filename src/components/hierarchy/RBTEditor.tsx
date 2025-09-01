import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Lightbulb, AlertTriangle, Save, X } from 'lucide-react';
import { RetroNode, RBTEntry, useRetroNodes } from '@/hooks/useRetroNodes';
import { useToast } from '@/hooks/use-toast';

interface RBTEditorProps {
  node: RetroNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RBTEditor: React.FC<RBTEditorProps> = ({
  node,
  isOpen,
  onClose
}) => {
  const [rose, setRose] = useState('');
  const [bud, setBud] = useState('');
  const [thorn, setThorn] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PRIVATE');
  const [existingEntries, setExistingEntries] = useState<RBTEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { fetchRBTEntries, saveRBTEntry } = useRetroNodes();
  const { toast } = useToast();

  useEffect(() => {
    if (node && isOpen) {
      loadRBTEntries();
    }
  }, [node, isOpen]);

  const loadRBTEntries = async () => {
    if (!node) return;
    
    setLoading(true);
    try {
      const entries = await fetchRBTEntries(node.id);
      setExistingEntries(entries);
      
      // Load current user's entry if exists
      const currentEntry = entries.find(entry => entry.is_current);
      if (currentEntry) {
        setRose(currentEntry.rose || '');
        setBud(currentEntry.bud || '');
        setThorn(currentEntry.thorn || '');
        setVisibility(currentEntry.visibility);
      }
    } catch (error) {
      console.error('Error loading RBT entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!node) return;
    
    setLoading(true);
    try {
      await saveRBTEntry({
        node_id: node.id,
        rose: rose.trim() || undefined,
        bud: bud.trim() || undefined,
        thorn: thorn.trim() || undefined,
        visibility,
      });
      
      await loadRBTEntries(); // Refresh entries
      
      toast({
        title: "Success",
        description: "RBT entry saved successfully",
      });
    } catch (error) {
      console.error('Error saving RBT entry:', error);
      toast({
        title: "Error",
        description: "Failed to save RBT entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRose('');
    setBud('');
    setThorn('');
    setVisibility('PRIVATE');
    onClose();
  };

  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>RBT Entries for: {node.title}</span>
            <Badge variant="outline">{node.type.toLowerCase()}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your RBT Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rose */}
                <div>
                  <Label className="flex items-center gap-2 text-green-600 mb-2">
                    <Heart className="h-4 w-4" />
                    Roses (What went well?)
                  </Label>
                  <Textarea
                    placeholder="Share what you appreciated, what worked well, or positive moments..."
                    value={rose}
                    onChange={(e) => setRose(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Bud */}
                <div>
                  <Label className="flex items-center gap-2 text-yellow-600 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    Buds (What has potential?)
                  </Label>
                  <Textarea
                    placeholder="Share opportunities, ideas for improvement, or things to develop..."
                    value={bud}
                    onChange={(e) => setBud(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Thorn */}
                <div>
                  <Label className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Thorns (What was challenging?)
                  </Label>
                  <Textarea
                    placeholder="Share challenges, frustrations, or things that didn't go well..."
                    value={thorn}
                    onChange={(e) => setThorn(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <Label className="mb-2 block">Visibility</Label>
                  <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private (Only me)</SelectItem>
                      <SelectItem value="FRIENDS">Friends</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleClose}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Existing Entries Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Entries</h3>
            
            {existingEntries.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No entries yet. Be the first to share your thoughts!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {existingEntries.map((entry) => (
                  <Card key={entry.id} className="text-sm">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {entry.visibility.toLowerCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {entry.rose && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Heart className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-600 text-xs">Rose</span>
                          </div>
                          <p className="text-xs pl-4">{entry.rose}</p>
                        </div>
                      )}
                      
                      {entry.bud && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Lightbulb className="h-3 w-3 text-yellow-600" />
                            <span className="font-medium text-yellow-600 text-xs">Bud</span>
                          </div>
                          <p className="text-xs pl-4">{entry.bud}</p>
                        </div>
                      )}
                      
                      {entry.thorn && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="font-medium text-red-600 text-xs">Thorn</span>
                          </div>
                          <p className="text-xs pl-4">{entry.thorn}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
