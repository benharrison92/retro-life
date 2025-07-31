import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flower, MessageCircle } from 'lucide-react';

interface AggregatedFeedbackProps {
  retros: any[];
}

export const AggregatedFeedback: React.FC<AggregatedFeedbackProps> = ({ retros }) => {
  // Aggregate all feedback items by type
  const aggregatedData = retros.reduce((acc, retro) => {
    const roses = Array.isArray(retro.roses) ? retro.roses : [];
    const buds = Array.isArray(retro.buds) ? retro.buds : [];
    const thorns = Array.isArray(retro.thorns) ? retro.thorns : [];
    
    acc.roses.push(...roses.map(item => ({ ...item, retroTitle: retro.title, userName: retro.user_profiles?.display_name || 'Anonymous' })));
    acc.buds.push(...buds.map(item => ({ ...item, retroTitle: retro.title, userName: retro.user_profiles?.display_name || 'Anonymous' })));
    acc.thorns.push(...thorns.map(item => ({ ...item, retroTitle: retro.title, userName: retro.user_profiles?.display_name || 'Anonymous' })));
    
    return acc;
  }, { roses: [], buds: [], thorns: [] });

  const renderFeedbackSection = (items: any[], title: string, icon: React.ReactNode, colorClass: string) => (
    <Card className="shadow-md">
      <CardHeader className={`${colorClass} text-white rounded-t-lg`}>
        <CardTitle className="text-xl flex items-center gap-2">
          {icon}
          {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No {title.toLowerCase()} feedback yet</p>
        ) : (
          items.map((item, index) => (
            <Card key={`${item.id}-${index}`} className="border border-muted">
              <CardContent className="p-3">
                <p className="text-sm mb-2">{item.text}</p>
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{item.userName}</span>
                  <span>•</span>
                  <span>{item.retroTitle}</span>
                  
                  {item.tags && item.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {item.comments && item.comments.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{item.comments.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Aggregated Feedback</h2>
        <p className="text-muted-foreground">
          All feedback from {retros.length} submissions combined
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {renderFeedbackSection(
          aggregatedData.roses,
          "Roses (What Went Well)",
          <span>🌹</span>,
          "bg-gradient-positive"
        )}
        
        {renderFeedbackSection(
          aggregatedData.buds,
          "Buds (Opportunities)",
          <Flower className="w-5 h-5" />,
          "bg-gradient-opportunity"
        )}
        
        {renderFeedbackSection(
          aggregatedData.thorns,
          "Thorns (Challenges)",
          <span>🌿</span>,
          "bg-gradient-negative"
        )}
      </div>
    </div>
  );
};