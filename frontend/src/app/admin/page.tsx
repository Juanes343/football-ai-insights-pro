import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = { title: 'Administración' };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground mt-1">Gestión y analítica de la plataforma</p>
      </div>
      <AdminDashboard />
    </div>
  );
}
