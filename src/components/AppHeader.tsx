import React from 'react';
import { RetroLogo } from './RetroLogo';
import { SocialHeader } from './SocialHeader';

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <RetroLogo />
        <SocialHeader />
      </div>
    </header>
  );
};