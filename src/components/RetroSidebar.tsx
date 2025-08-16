import React from 'react';
import { X } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { RetroMapCard } from '@/components/RetroMapCard';
import { Button } from '@/components/ui/button';

interface RetroLocation {
  id: string;
  title: string;
  event_type: string;
  date: string;
  latitude: number;
  longitude: number;
  location_name: string;
  city?: string;
  state?: string;
  country?: string;
  roses: any;
  buds: any;
  thorns: any;
  photos: any;
  primary_photo_url?: string;
  user_profiles: {
    display_name: string;
  };
}

interface RetroSidebarProps {
  selectedRetro: RetroLocation | null;
  onClose: () => void;
  onSave: () => void;
  onLike: (retroId: string) => void;
  currentUser: any;
}

export function RetroSidebar({ 
  selectedRetro, 
  onClose, 
  onSave, 
  onLike, 
  currentUser 
}: RetroSidebarProps) {
  const { open, setOpen } = useSidebar();

  React.useEffect(() => {
    setOpen(!!selectedRetro);
  }, [selectedRetro, setOpen]);

  if (!selectedRetro) return null;

  return (
    <Sidebar side="right" className="w-96">
      <SidebarHeader className="flex flex-row items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Retro Details</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <RetroMapCard
          retro={selectedRetro}
          onSave={onSave}
          onLike={() => onLike(selectedRetro.id)}
          currentUser={currentUser}
        />
      </SidebarContent>
    </Sidebar>
  );
}