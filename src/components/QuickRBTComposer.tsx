import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export type QuickPayload = {
  title: string;
  locationName?: string;
  tags: string[];
  roses: string[];
  buds: string[];
  thorns: string[];
}

export default function QuickRBTComposer({ open, onClose, onSave }: { open: boolean; onClose:()=>void; onSave:(p: QuickPayload)=>Promise<void>|void }){
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string>('');
  const [roses, setRoses] = useState('');
  const [buds, setBuds] = useState('');
  const [thorns, setThorns] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if(!title.trim()) return;
    setSaving(true);
    try{
      await onSave({
        title: title.trim(),
        locationName: location.trim() || undefined,
        tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        roses: splitLines(roses),
        buds: splitLines(buds),
        thorns: splitLines(thorns),
      });
      onClose();
      reset();
    } finally { setSaving(false); }
  };

  const reset = () => { setTitle(''); setLocation(''); setTags(''); setRoses(''); setBuds(''); setThorns(''); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Quick Retro (Rose • Bud • Thorn)</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Hawaii Family Trip" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Location</label>
              <Input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Maui, HI" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tags (comma separated)</label>
              <Input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Travel, Hotel, Hawaii" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-rose-700">Roses — what went well (one per line)</label>
            <Textarea value={roses} onChange={e=>setRoses(e.target.value)} placeholder={"Sea turtles at Wailea\nFamily gratitude"} rows={3} />
          </div>
          <div>
            <label className="text-xs font-medium text-emerald-700">Buds — opportunities/ideas (one per line)</label>
            <Textarea value={buds} onChange={e=>setBuds(e.target.value)} placeholder="Start a business to sustain our dream life" rows={3} />
          </div>
          <div>
            <label className="text-xs font-medium text-amber-700">Thorns — what to improve (one per line)</label>
            <Textarea value={thorns} onChange={e=>setThorns(e.target.value)} placeholder="Arrive earlier to airport during spring break" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={!title.trim()}>{saving? 'Saving…':'Save Retro'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function splitLines(s: string){ 
  return s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,5);
}
