'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export function ProfileView() {
  const { user, logout } = useAuth();

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/users/subscription');
      return data.data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['prediction-stats'],
    queryFn: async () => {
      const { data } = await api.get('/users/prediction-stats');
      return data.data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Nombre</span>
            <span className="font-medium">{user.name ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Correo electrónico</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Rol</span>
            <Badge variant={user.role === 'PREMIUM' ? 'default' : 'secondary'}>{user.role}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Miembro desde</span>
            <span className="font-medium">{formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Plan</span>
                <span className="font-medium capitalize">{subscription.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Estado</span>
                <Badge>{subscription.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Se renueva</span>
                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">Estás en el plan gratuito.</p>
              <Button size="sm">Pasar a Premium</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction stats */}
      {stats && (
        <Card>
          <CardHeader><CardTitle>Estadísticas de predicciones</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{stats.total ?? 0}</p>
              <p className="text-xs text-muted-foreground">Guardadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.correct ?? 0}</p>
              <p className="text-xs text-muted-foreground">Acertadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.accuracy ? `${Math.round(stats.accuracy * 100)}%` : '—'}</p>
              <p className="text-xs text-muted-foreground">Precisión</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="destructive" size="sm" onClick={logout}>Cerrar sesión</Button>
    </div>
  );
}
