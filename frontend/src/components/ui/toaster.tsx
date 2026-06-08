'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Toast = { id: string; title: string; description?: string; variant?: 'default' | 'destructive' };

const toastContext = React.createContext<{
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}>({ toasts: [], toast: () => {}, dismiss: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <toastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </toastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(toastContext);
}

export function Toaster() {
  const { toasts, dismiss } = React.useContext(toastContext);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'rounded-lg border p-4 shadow-lg cursor-pointer transition-all animate-slide-in',
            t.variant === 'destructive'
              ? 'border-destructive bg-destructive text-destructive-foreground'
              : 'border-border bg-card text-foreground'
          )}
        >
          <p className="font-semibold text-sm">{t.title}</p>
          {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
