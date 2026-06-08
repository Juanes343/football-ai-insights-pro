import type { Metadata } from 'next';
import { PredictionsHub } from '@/components/predictions/PredictionsHub';

export const metadata: Metadata = { title: 'Predicciones con IA' };

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predicciones con IA</h1>
        <p className="text-muted-foreground mt-1">Predicciones de resultados impulsadas por machine learning</p>
      </div>
      <PredictionsHub />
    </div>
  );
}
