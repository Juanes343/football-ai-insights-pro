'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Brain, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/users/admin/all');
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Usuarios totales" value={users?.length ?? '—'} />
        <StatCard icon={Activity} label="Suscripciones activas" value={users?.filter((u: { role: string }) => u.role === 'PREMIUM').length ?? '—'} />
        <StatCard icon={Brain} label="Estado del modelo IA" value="En línea" highlight />
        <StatCard icon={TrendingUp} label="Estado de la API" value="Operativa" highlight />
      </div>

      <Card>
        <CardHeader><CardTitle>Usuarios</CardTitle></CardHeader>
        <CardContent>
          {users ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left">Correo</th>
                  <th className="pb-2 text-left">Nombre</th>
                  <th className="pb-2 text-left">Rol</th>
                  <th className="pb-2 text-left">Verificado</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 20).map((u: { id: string; email: string; name: string | null; role: string; emailVerified: boolean }) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.name ?? '—'}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">{u.emailVerified ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-32 animate-pulse bg-accent rounded-lg" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight }: { icon: React.ElementType; label: string; value: string | number; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
