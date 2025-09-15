import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TripPlanner, TripPlannerItem } from '@/hooks/useTripPlanners';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';

interface TripCalendarViewProps {
  items: TripPlannerItem[];
  tripPlanner: TripPlanner;
  onAddItem: () => void;
}

export const TripCalendarView = ({ items, tripPlanner, onAddItem }: TripCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation': return '🏨';
      case 'travel': return '✈️';
      case 'activity': return '🎯';
      case 'food': return '🍽️';
      case 'other': return '📝';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'border-l-green-500';
      case 'pending_review': return 'border-l-yellow-500';
      case 'declined': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const getItemsForDate = (date: Date) => {
    return items.filter(item => 
      item.scheduled_date && 
      isSameDay(new Date(item.scheduled_date), date)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button size="sm" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {daysInMonth.map(date => {
          const dayItems = getItemsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          
          return (
            <Card 
              key={date.toISOString()} 
              className={`min-h-24 ${!isCurrentMonth ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-2">
                <div className="text-sm font-medium mb-1">
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayItems.map(item => (
                    <div 
                      key={item.id}
                      className={`text-xs p-1 rounded border-l-2 ${getStatusColor(item.status)} bg-muted/50 truncate`}
                      title={`${item.title}${item.scheduled_time ? ` at ${item.scheduled_time}` : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        <span>{getEventTypeIcon(item.event_type)}</span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.scheduled_time && (
                        <div className="text-muted-foreground">
                          {item.scheduled_time}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-4 border-l-green-500 bg-muted/50"></div>
            <span className="text-sm">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-4 border-l-yellow-500 bg-muted/50"></div>
            <span className="text-sm">Pending Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-l-4 border-l-red-500 bg-muted/50"></div>
            <span className="text-sm">Declined</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};