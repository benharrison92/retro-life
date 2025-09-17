import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/hooks/useFeed';
import { 
  Heart, 
  Sprout, 
  AlertTriangle, 
  Calendar,
  MapPin,
  User
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onRetroClick?: (retroId: string) => void;
  onRBTItemClick?: (activity: Activity) => void;
}

export const ActivityCard = ({ activity, onRetroClick, onRBTItemClick }: ActivityCardProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'retro_created':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'rose_added':
        return <Heart className="h-4 w-4 text-rose-600" />;
      case 'bud_added':
        return <Sprout className="h-4 w-4 text-green-600" />;
      case 'thorn_added':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityText = (type: string, data: any) => {
    const userName = activity.user_profiles?.display_name || 'Someone';
    
    switch (type) {
      case 'retro_created':
        return `${userName} created a new ${data.event_type || 'retrospective'}: "${data.title}"`;
      case 'rose_added':
        return `${userName} added a rose to "${data.title}"`;
      case 'bud_added':
        return `${userName} added a bud to "${data.title}"`;
      case 'thorn_added':
        return `${userName} added a thorn to "${data.title}"`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'retro_created':
        return 'bg-blue-50 border-blue-200';
      case 'rose_added':
        return 'bg-rose-50 border-rose-200';
      case 'bud_added':
        return 'bg-green-50 border-green-200';
      case 'thorn_added':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleClick = () => {
    // Handle R/B/T item clicks differently from retro clicks
    if (['rose_added', 'bud_added', 'thorn_added'].includes(activity.activity_type) && onRBTItemClick) {
      onRBTItemClick(activity);
    } else if (activity.target_id && onRetroClick) {
      onRetroClick(activity.target_id);
    }
  };

  return (
    <Card 
      className={`${getActivityColor(activity.activity_type)} transition-colors cursor-pointer hover:shadow-md`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={activity.user_profiles?.avatar_url} />
            <AvatarFallback>
              {activity.user_profiles?.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getActivityIcon(activity.activity_type)}
              <p className="text-sm font-medium text-gray-900">
                {getActivityText(activity.activity_type, activity.data)}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
              
              {activity.activity_type === 'retro_created' && activity.data.event_type && (
                <Badge variant="secondary" className="text-xs">
                  {activity.data.event_type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};