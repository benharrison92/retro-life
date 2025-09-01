import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  id: string;
  title: string;
  level: number;
}

interface RetroBreadcrumbProps {
  retroId: string;
  className?: string;
}

export const RetroBreadcrumb: React.FC<RetroBreadcrumbProps> = ({ retroId, className }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreadcrumbs = async () => {
      try {
        const { data, error } = await supabase.rpc('get_retro_breadcrumb', {
          retro_uuid: retroId
        });

        if (error) {
          console.error('Error fetching breadcrumbs:', error);
          return;
        }

        setBreadcrumbs(data || []);
      } catch (error) {
        console.error('Error fetching breadcrumbs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (retroId) {
      fetchBreadcrumbs();
    }
  }, [retroId]);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for top-level retros
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/')}
      >
        <Home className="h-3 w-3" />
      </Button>
      
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-3 w-3" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 ${
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => {
              if (index < breadcrumbs.length - 1) {
                navigate(`/trip/${item.id}`);
              }
            }}
            disabled={index === breadcrumbs.length - 1}
          >
            {item.title}
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};