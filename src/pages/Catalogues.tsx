import { useState } from 'react';
import { CatalogueManager } from '@/components/catalogue/CatalogueManager';
import { CatalogueView } from '@/components/catalogue/CatalogueView';
import { Catalogue } from '@/lib/supabase';

export default function Catalogues() {
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue | null>(null);

  if (selectedCatalogue) {
    return (
      <CatalogueView
        catalogue={selectedCatalogue}
        onBack={() => setSelectedCatalogue(null)}
      />
    );
  }

  return (
    <CatalogueManager
      onSelectCatalogue={setSelectedCatalogue}
    />
  );
}