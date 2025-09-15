import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTripPlanners } from '@/hooks/useTripPlanners';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CreateTripPlannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTripPlannerDialog = ({ isOpen, onClose }: CreateTripPlannerDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const { createTripPlanner } = useTripPlanners();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTripPlanner(
        title.trim(),
        description.trim() || undefined,
        undefined,
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0]
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartDate(undefined);
      setEndDate(undefined);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Trip Planner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Europe Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your trip plans..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!title.trim() || loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Trip Planner"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Tip: Use Ctrl+Enter to quickly create your trip planner
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};