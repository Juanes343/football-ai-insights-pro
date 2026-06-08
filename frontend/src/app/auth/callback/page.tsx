'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    const refresh = params.get('refresh');
    if (token && refresh) {
      setTokens(token, refresh);
      router.push('/dashboard');
    } else {
      router.push('/auth/login?error=oauth');
    }
  }, [params, router, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Completando el inicio de sesión…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
