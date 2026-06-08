import type { Metadata } from 'next';
import { LeaguesBrowser } from '@/components/leagues/LeaguesBrowser';

export const metadata: Metadata = { title: 'Ligas' };

export default function LeaguesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ligas</h1>
        <p className="text-muted-foreground mt-1">Explora competiciones y tablas de posiciones de todo el mundo</p>
      </div>
      <LeaguesBrowser />
    </div>
  );
}
