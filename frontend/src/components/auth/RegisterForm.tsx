'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export function RegisterForm() {
  const { registerMutation } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    registerMutation.mutate(form);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Comienza tu experiencia de analítica futbolística</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Tu nombre" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tucorreo@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Mín. 8 caracteres" minLength={8} />
          </div>
          {registerMutation.isError && (
            <p className="text-sm text-destructive">{(registerMutation.error as Error)?.message ?? 'No se pudo crear la cuenta'}</p>
          )}
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">Inicia sesión</Link>
        </p>
      </CardContent>
    </Card>
  );
}
