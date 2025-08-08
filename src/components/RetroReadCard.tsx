import React, { useEffect } from 'react';

export default function RetroReadCard() {
  useEffect(() => {
    document.title = 'RetroReadCard | Retro';
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const content = 'RetroReadCard blank component page to add your content.';
    if (desc) {
      desc.setAttribute('content', content);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <section className="min-h-[50vh] w-full bg-background text-foreground flex items-center justify-center border border-dashed border-border rounded-lg">
      <div className="text-center space-y-2 p-8">
        <h1 className="text-2xl font-semibold tracking-tight">RetroReadCard</h1>
        <p className="text-muted-foreground">Blank component. Add your content here.</p>
      </div>
    </section>
  );
}
