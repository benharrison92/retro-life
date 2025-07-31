import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RetroLogo = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/')}
      className="flex items-center gap-2 text-lg font-bold hover:bg-transparent"
    >
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
        R
      </div>
      <span className="hidden sm:inline">Retro</span>
    </Button>
  );
};