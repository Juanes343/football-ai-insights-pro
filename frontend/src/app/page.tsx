import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, BarChart3, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">Football AI Insights Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Empieza gratis</Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 animate-slide-in">
            🤖 Impulsado por IA avanzada
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Analítica de fútbol{' '}
            <span className="gradient-text">con IA profesional</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Datos de partidos en tiempo real, predicciones con inteligencia artificial,
            estadísticas avanzadas y actualizaciones en vivo. Toma mejores decisiones con
            la plataforma de inteligencia futbolística más precisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base px-8">
                Ir al panel <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="lg" variant="outline" className="text-base px-8">
                Partidos en vivo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1.000+', label: 'Partidos analizados al día' },
            { value: '87%', label: 'Precisión de predicciones' },
            { value: '50+', label: 'Ligas activas' },
            { value: 'Tiempo real', label: 'Actualización de datos' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Todo lo que necesitas</h2>
        <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
          Desde marcadores en vivo hasta análisis profundo con IA, todo en una sola plataforma profesional.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/10 border-y border-primary/20">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Empieza a analizar hoy</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Únete a miles de analistas que usan Football AI Insights Pro.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2 px-10 text-base">
              Crear cuenta gratis <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>Football AI Insights Pro</span>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Términos</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contacto</Link>
        </div>
      </footer>
    </main>
  );
}

const features = [
  { title: 'Centro de partidos en vivo', description: 'Marcadores en tiempo real, eventos minuto a minuto, goles, tarjetas y cambios al instante.', icon: Activity },
  { title: 'Predicciones con IA', description: 'Modelos de machine learning analizan más de 50 variables para predecir resultados, goles y ambos marcan.', icon: Brain },
  { title: 'Estadísticas avanzadas', description: 'xG, posesión, remates, tiros de esquina, precisión de pases y analítica profunda de equipos y jugadores.', icon: BarChart3 },
  { title: 'Actualizaciones en tiempo real', description: 'Las conexiones WebSocket entregan los datos sin necesidad de recargar la página.', icon: Zap },
  { title: 'Alertas Premium', description: 'Recibe notificaciones antes del inicio, en cada gol, al medio tiempo y al pitazo final.', icon: Shield },
  { title: 'Sistema que aprende', description: 'La IA mejora continuamente aprendiendo de predicciones pasadas y resultados reales.', icon: TrendingUp },
];
