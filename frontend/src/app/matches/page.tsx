import type { Metadata } from 'next';
import { MatchesCenter } from '@/components/matches/MatchesCenter';

export const metadata: Metadata = { title: 'Partidos' };

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Centro de partidos</h1>
        <p className="text-muted-foreground mt-1">Partidos en vivo y programados con actualizaciones en tiempo real</p>
      </div>
      <MatchesCenter />
    </div>
  );
}
