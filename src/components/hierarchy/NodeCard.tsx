import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Map,
  Building,
  Plane,
  Utensils,
  Calendar as CalendarIcon,
  Notebook
} from 'lucide-react';
import { RetroNode } from '@/hooks/useRetroNodes';
import { format } from 'date-fns';

interface NodeCardProps {
  node: RetroNode;
  onExpand?: () => void;
  onAddChild?: (type: RetroNode['type']) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenRBT?: () => void;
  isExpanded?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const getNodeIcon = (type: RetroNode['type']) => {
  switch (type) {
    case 'TRIP': return Plane;
    case 'CATEGORY': return Building;
    case 'CITY': return MapPin;
    case 'VENUE': return Map;
    case 'EVENT': return CalendarIcon;
    case 'NOTEBOOK': return Notebook;
    default: return Map;
  }
};

const getNodeColor = (type: RetroNode['type']) => {
  switch (type) {
    case 'TRIP': return 'bg-blue-500';
    case 'CATEGORY': return 'bg-green-500';
    case 'CITY': return 'bg-purple-500';
    case 'VENUE': return 'bg-orange-500';
    case 'EVENT': return 'bg-red-500';
    case 'NOTEBOOK': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  onExpand,
  onAddChild,
  onEdit,
  onDelete,
  onOpenRBT,
  isExpanded,
  showActions = true,
  compact = false
}) => {
  const Icon = getNodeIcon(node.type);
  const colorClass = getNodeColor(node.type);
  
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Card className={`w-full transition-all duration-200 hover:shadow-md ${compact ? 'p-2' : ''}`}>
      <CardHeader className={`pb-3 ${compact ? 'pb-2 pt-2' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${colorClass} text-white`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <CardTitle className={`${compact ? 'text-sm' : 'text-lg'}`}>
                {node.title}
              </CardTitle>
              {node.subtitle && (
                <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
                  {node.subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {node.type.toLowerCase()}
            </Badge>
            {hasChildren && onExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="h-6 w-6 p-0"
              >
                <ChevronRight 
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${compact ? 'pb-2' : ''}`}>
        {/* Date Range */}
        {(node.start_date || node.end_date) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>
              {node.start_date && format(new Date(node.start_date), 'MMM dd')}
              {node.start_date && node.end_date && ' - '}
              {node.end_date && format(new Date(node.end_date), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRBT}
              className="text-xs"
            >
              RBT Entries
            </Button>
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            
            {onAddChild && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddChild('CATEGORY')}
                className="h-7 w-7 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Visibility Badge */}
        <div className="flex justify-end mt-2">
          <Badge 
            variant={node.visibility === 'PUBLIC' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {node.visibility.toLowerCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};