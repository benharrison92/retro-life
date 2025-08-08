import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

export default function ReminderPrompt({ open, onClose, defaultMessage, tags }: { open: boolean; onClose:()=>void; defaultMessage: string; tags?: string[] }) {
  const [message, setMessage] = useState(defaultMessage);
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any).from('reminders').insert({
      user_id: user.id,
      message,
      due_date: date || null,
      tags: tags || [],
      source: 'retro',
    });
    setSaving(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Set a reminder?</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input value={message} onChange={e=>setMessage(e.target.value)} />
          <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Skip</Button>
            <Button onClick={save} disabled={saving || !message.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
