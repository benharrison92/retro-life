import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { RetroCard } from "./RetroCard";
import { Retro, RBTItem } from "./RetroApp";

interface RetroDetailViewProps {
  retro: Retro & {
    locationName?: string;
    city?: string;
    state?: string;
    country?: string;
    feedbackSpaceName?: string;
    feedbackSpaceId?: string;
  };
  onBack: () => void;
  onEdit: (retro: Retro) => void;
  onDelete: (retro: Retro) => void;
  onUpdateItem: (retroId: string, itemType: 'roses' | 'buds' | 'thorns', itemId: string, updatedItem: RBTItem) => void;
  onAddItem?: (retroId: string, itemType: 'roses' | 'buds' | 'thorns') => void;
  onUserClick?: (userName: string) => void;
  currentUserName: string;
}

export const RetroDetailView = ({ 
  retro, 
  onBack, 
  onEdit, 
  onDelete, 
  onUpdateItem, 
  onAddItem,
  onUserClick,
  currentUserName 
}: RetroDetailViewProps) => {
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Retros
        </Button>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button
            onClick={() => onEdit(retro)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(retro)}
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Retro Detail Card */}
      <RetroCard
        retro={retro}
        onEdit={onEdit}
        onDelete={onDelete}
        onUpdateItem={onUpdateItem}
        onAddItem={onAddItem}
        onUserClick={onUserClick}
        currentUserName={currentUserName}
      />
    </div>
  );
};