import type { Metadata } from 'next';
import { MatchDetail } from '@/components/matches/MatchDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Detalle del partido' };

export default async function MatchPage({ params }: Props) {
  const { id } = await params;
  return <MatchDetail matchId={parseInt(id)} />;
}
