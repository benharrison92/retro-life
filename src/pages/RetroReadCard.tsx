import React, { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flower2, Sprout, OctagonX, MapPin, Calendar, Lightbulb } from 'lucide-react'

// Uses your existing Retrospective shape (roses/buds/thorns = RBTItem[] with { id, text, ... })
export type RBTItem = { id: string; text: string; tags?: string[]; comments?: any[] }
export type Retrospective = {
  id: string
  title: string
  date?: string | null
  location_name?: string | null
  tags?: string[] | null
  roses?: RBTItem[] | null
  buds?: RBTItem[] | null
  thorns?: RBTItem[] | null
}

// The card component from your snippet (renamed internally to avoid route export conflicts)
function RetroReadCardCard({
  retro,
  onOpen,
  onPlanClick,
}: {
  retro: Retrospective
  onOpen: (id: string) => void
  onPlanClick?: (retro: Retrospective) => void
}) {
  const top = (arr?: RBTItem[] | null) => (arr || []).slice(0, 3)

  return (
    <Card className="p-4 shadow-elegant">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{retro.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {retro.date && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/>{retro.date.slice(0,10)}</span>
            )}
            {retro.location_name && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{retro.location_name}</span>
            )}
            {(retro.tags || []).slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {onPlanClick && (
            <Button variant="secondary" size="sm" onClick={() => onPlanClick(retro)}>
              <Lightbulb className="mr-1 h-4 w-4"/> Plan reminder
            </Button>
          )}
          <Button size="sm" onClick={() => onOpen(retro.id)}>Open</Button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <RBTList title="Rose" icon={<Flower2 className="h-4 w-4"/>} color="text-rose-700" bullets={top(retro.roses)} empty="Add a quick win…" />
        <RBTList title="Bud" icon={<Sprout className="h-4 w-4"/>} color="text-emerald-700" bullets={top(retro.buds)} empty="What could grow next time?" />
        <RBTList title="Thorn" icon={<OctagonX className="h-4 w-4"/>} color="text-amber-700" bullets={top(retro.thorns)} empty="What to improve?" />
      </div>
    </Card>
  )
}

function RBTList({ title, icon, color, bullets, empty }: { title: string; icon: React.ReactNode; color: string; bullets?: RBTItem[]; empty: string }) {
  return (
    <div>
      <div className={`mb-1 flex items-center gap-1 text-sm font-medium ${color}`}>
        {icon} {title}
      </div>
      {bullets && bullets.length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {bullets.map((b) => (
            <li key={b.id} className="leading-snug">{b.text}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground">{empty}</div>
      )}
    </div>
  )
}

// Page wrapper that renders the card with sample data and SEO
export default function RetroReadCard() {
  useEffect(() => {
    document.title = 'RetroReadCard | Retro';
    const descContent = 'Quick read card for Roses, Buds, Thorns.';
    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (desc) {
      desc.setAttribute('content', descContent);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = descContent;
      document.head.appendChild(m);
    }
    // Canonical
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.origin + '/retro-read-card';
  }, []);

  const sample: Retrospective = {
    id: 'demo-1',
    title: 'Team Sync Retrospective',
    date: new Date().toISOString(),
    location_name: 'Remote',
    tags: ['release', 'v1.2', 'team'],
    roses: [
      { id: 'r1', text: 'Shipped the feature on time' },
      { id: 'r2', text: 'Great cross-team collaboration' },
      { id: 'r3', text: 'Code quality improved' },
    ],
    buds: [
      { id: 'b1', text: 'Experiment with performance budgets' },
      { id: 'b2', text: 'Improve onboarding docs' },
    ],
    thorns: [
      { id: 't1', text: 'CI pipeline flakiness' },
    ],
  };

  return (
    <main className="container mx-auto max-w-3xl p-4">
      <h1 className="sr-only">RetroReadCard</h1>
      <RetroReadCardCard
        retro={sample}
        onOpen={(id) => console.log('Open retro', id)}
        onPlanClick={(r) => console.log('Plan reminder for', r.id)}
      />
    </main>
  );
}
