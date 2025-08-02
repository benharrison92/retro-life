import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface AddRBTDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, tags: string[]) => void;
  type: 'roses' | 'buds' | 'thorns';
}

const typeConfig = {
  roses: {
    title: 'Add Rose',
    emoji: '🌹',
    placeholder: 'What went well?',
    color: 'text-red-600'
  },
  buds: {
    title: 'Add Bud',
    emoji: '🌱',
    placeholder: 'What are the opportunities?',
    color: 'text-yellow-600'
  },
  thorns: {
    title: 'Add Thorn',
    emoji: '🌿',
    placeholder: 'What were the challenges?',
    color: 'text-orange-600'
  }
};

export const AddRBTDialog = ({ isOpen, onClose, onSubmit, type }: AddRBTDialogProps) => {
  const [text, setText] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const config = typeConfig[type];

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    
    onSubmit(text.trim(), tags);
    
    // Reset form
    setText('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.currentTarget === document.querySelector('[data-tag-input]')) {
        e.preventDefault();
        handleAddTag();
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${config.color}`}>
            <span className="text-2xl">{config.emoji}</span>
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rbt-text" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="rbt-text"
              placeholder={config.placeholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="mt-1 min-h-[100px] resize-none"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="tag-input" className="text-sm font-medium">
              Tags (optional)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tag-input"
                data-tag-input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={config.color}
          >
            Add {type === 'roses' ? 'Rose' : type === 'buds' ? 'Bud' : 'Thorn'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};