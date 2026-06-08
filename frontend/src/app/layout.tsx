import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Football AI Insights Pro',
    template: '%s | Football AI Insights Pro',
  },
  description: 'Plataforma profesional de analítica de fútbol con inteligencia artificial: datos en tiempo real, estadísticas avanzadas y predicciones de partidos.',
  keywords: ['fútbol', 'IA', 'predicciones', 'estadísticas', 'marcadores en vivo'],
  authors: [{ name: 'Football AI Insights Pro' }],
  openGraph: {
    title: 'Football AI Insights Pro',
    description: 'Analítica y predicciones de fútbol con inteligencia artificial',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
