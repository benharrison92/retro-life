import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, RefreshCw, Copy, CheckCircle } from 'lucide-react';

interface JournalPromptsDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'roses' | 'buds' | 'thorns';
  onUsePrompt?: (prompt: string) => void;
}

const journalPrompts = {
  roses: [
    "What moment from this experience brought you the most joy? Describe it in detail.",
    "What unexpected positive outcome surprised you during this time?",
    "Which person made the biggest positive impact on your experience? How?",
    "What skill or strength did you discover or strengthen during this period?",
    "What are you most grateful for from this experience?",
    "What achievement, no matter how small, are you proudest of?",
    "How did this experience exceed your expectations?",
    "What positive habit or routine emerged from this time?",
    "What made you laugh or smile the most during this experience?",
    "How did you grow or change for the better?",
    "What positive feedback or recognition did you receive?",
    "What beautiful or meaningful moment will you always remember?",
  ],
  buds: [
    "What opportunity emerged from this experience that you'd like to pursue?",
    "What would you do differently if you could repeat this experience?",
    "What new skill would enhance your future experiences like this?",
    "How could you better prepare for similar situations in the future?",
    "What relationship could you invest more time in developing?",
    "What habit would you like to cultivate based on this experience?",
    "What goal has this experience inspired you to set?",
    "How could you share what you learned with others?",
    "What aspect of this experience would you like to explore deeper?",
    "What would make the next similar experience even better?",
    "What conversation do you need to have based on this experience?",
    "What system or process could you improve for next time?",
  ],
  thorns: [
    "What was the most challenging moment, and what did it teach you?",
    "What obstacle caught you off guard? How will you prepare differently?",
    "What frustration keeps coming up in similar situations?",
    "What communication breakdown occurred, and how could it be prevented?",
    "What assumption you made turned out to be incorrect?",
    "What resource or support were you missing that would have helped?",
    "What pattern of behavior did you notice in yourself that you'd like to change?",
    "What expectation wasn't met, and why?",
    "What fear or anxiety held you back during this experience?",
    "What conflict arose, and what was the root cause?",
    "What mistake did you make, and what's the lesson learned?",
    "What external factor negatively impacted your experience?",
  ]
};

export function JournalPromptsDialog({ open, onClose, type, onUsePrompt }: JournalPromptsDialogProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const prompts = journalPrompts[type];
  const typeColors = {
    roses: 'bg-positive-muted text-positive border-positive/30',
    buds: 'bg-opportunity-muted text-opportunity border-opportunity/30',
    thorns: 'bg-negative-muted text-negative border-negative/30'
  };

  const typeLabels = {
    roses: 'Roses (Positives)',
    buds: 'Buds (Opportunities)',
    thorns: 'Thorns (Challenges)'
  };

  const handleRefreshPrompts = () => {
    // Shuffle and select 6 random prompts
    const shuffled = [...prompts].sort(() => Math.random() - 0.5);
    setSelectedPrompts(shuffled.slice(0, 6));
  };

  const handleCopyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handleUsePrompt = (prompt: string) => {
    onUsePrompt?.(prompt);
    onClose();
  };

  // Initialize with random prompts when dialog opens
  React.useEffect(() => {
    if (open && selectedPrompts.length === 0) {
      handleRefreshPrompts();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Journal Prompts for {typeLabels[type]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Use these prompts to write more thoughtful and detailed entries
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPrompts}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New Prompts
            </Button>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {selectedPrompts.map((prompt, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${typeColors[type]} transition-all hover:shadow-sm`}
                >
                  <p className="text-sm leading-relaxed mb-3">{prompt}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyPrompt(prompt)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {copiedPrompt === prompt ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </Button>
                    {onUsePrompt && (
                      <Button
                        size="sm"
                        onClick={() => handleUsePrompt(prompt)}
                        className="text-xs"
                      >
                        Use This Prompt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}