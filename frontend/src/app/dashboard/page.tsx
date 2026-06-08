import type { Metadata } from 'next';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export const metadata: Metadata = { title: 'Panel' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel</h1>
        <p className="text-muted-foreground mt-1">Tu resumen de analítica futbolística</p>
      </div>
      <DashboardOverview />
    </div>
  );
}
