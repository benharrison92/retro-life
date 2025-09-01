import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  itemType: 'roses' | 'buds' | 'thorns';
}

const itemConfig = {
  roses: {
    title: 'Add Rose',
    emoji: '🌹',
    description: 'What went well? Share something positive from this experience.',
    placeholder: 'Describe something that went well...',
    color: 'text-positive',
  },
  buds: {
    title: 'Add Bud',
    emoji: '🌱',
    description: 'What opportunities do you see? What could grow?',
    placeholder: 'Describe an opportunity or potential improvement...',
    color: 'text-opportunity',
  },
  thorns: {
    title: 'Add Thorn',
    emoji: '🌿',
    description: 'What challenges did you face? What could be improved?',
    placeholder: 'Describe a challenge or area for improvement...',
    color: 'text-negative',
  },
};

export function AddItemDialog({ isOpen, onClose, onConfirm, itemType }: AddItemDialogProps) {
  const [text, setText] = useState('');
  const config = itemConfig[itemType];

  const handleSubmit = () => {
    if (text.trim()) {
      onConfirm(text.trim());
      setText('');
      onClose();
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${config.color}`}>
            <span className="text-lg">{config.emoji}</span>
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-text">Your reflection</Label>
            <Textarea
              id="item-text"
              placeholder={config.placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!text.trim()}
            className="gap-2"
          >
            <span>{config.emoji}</span>
            Add {itemType === 'roses' ? 'Rose' : itemType === 'buds' ? 'Bud' : 'Thorn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}