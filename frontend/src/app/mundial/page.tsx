import type { Metadata } from 'next';
import { WorldCupView } from '@/components/worldcup/WorldCupView';

export const metadata: Metadata = { title: 'Mundial 2026' };

export default function MundialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🏆 Mundial 2026</h1>
        <p className="text-muted-foreground mt-1">
          Predicciones de los 72 partidos de fase de grupos y tabla proyectada de cada grupo
        </p>
      </div>
      <WorldCupView />
    </div>
  );
}
