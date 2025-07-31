import { useState } from 'react';
import { CatalogueManager } from '@/components/catalogue/CatalogueManager';
import { CatalogueView } from '@/components/catalogue/CatalogueView';
import { PendingCatalogueInvitations } from '@/components/catalogue/PendingCatalogueInvitations';
import { Catalogue } from '@/lib/supabase';
import { AppHeader } from '@/components/AppHeader';

export default function Catalogues() {
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue | null>(null);

  if (selectedCatalogue) {
    return (
      <>
        <AppHeader />
        <CatalogueView
          catalogue={selectedCatalogue}
          onBack={() => setSelectedCatalogue(null)}
        />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto p-6 space-y-6">
        <PendingCatalogueInvitations />
        <CatalogueManager
          onSelectCatalogue={setSelectedCatalogue}
        />
      </div>
    </>
  );
}