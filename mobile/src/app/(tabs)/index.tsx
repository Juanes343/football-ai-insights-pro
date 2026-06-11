import { ScrollView, View, Text, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { format, subDays } from 'date-fns';
import { useLiveMatches } from '@/hooks/useMatches';
import { useTopPredictions, useResults, type ResultItem } from '@/hooks/usePredictions';
import { MatchCard } from '@/components/MatchCard';
import { PredictionCard } from '@/components/PredictionCard';
import { Card, Muted, Loading, Empty, SectionTitle, IconBadge } from '@/components/ui';
import { theme } from '@/lib/theme';

const SHORT: Record<string, string> = { HOME_WIN: 'Local', DRAW: 'Empate', AWAY_WIN: 'Visitante' };

export default function Panel() {
  const live = useLiveMatches();
  const top = useTopPredictions();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const results = useResults(yesterday);

  const refreshing = live.isRefetching || top.isRefetching || results.isRefetching;
  const onRefresh = () => {
    live.refetch();
    top.refetch();
    results.refetch();
  };

  const acc = results.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 18 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    >
      {/* Stats */}
      <View style={styles.stats}>
        <Stat icon="pulse" label="En vivo" value={live.data?.length ?? '—'} color={theme.colors.red} />
        <Stat
          icon="trophy"
          label="Aciertos ayer"
          value={acc ? acc.correct : '—'}
          sub={acc && acc.total > 0 ? `de ${acc.total} · ${Math.round(acc.accuracy * 100)}%` : undefined}
          color={theme.colors.gold}
        />
        <Stat icon="sparkles" label="Pronósticos" value={top.data?.length ?? '—'} color={theme.colors.primary} />
      </View>

      {/* Mejor pronóstico */}
      <SectionTitle gold>Mejor pronóstico</SectionTitle>
      {top.isLoading ? (
        <Loading />
      ) : top.data && top.data[0] ? (
        <PredictionCard prediction={top.data[0]} accent="gold" />
      ) : (
        <Card><Empty>Aún no hay predicciones</Empty></Card>
      )}

      {/* Resultados de ayer */}
      <SectionTitle>Resultados de ayer</SectionTitle>
      {results.isLoading ? (
        <Loading />
      ) : acc && acc.items.length > 0 ? (
        <View style={{ gap: 8 }}>
          {acc.items.slice(0, 12).map((r) => <ResultRow key={r.externalId} r={r} />)}
        </View>
      ) : (
        <Card><Empty>Aún no hay resultados evaluados de ayer.</Empty></Card>
      )}

      {/* En vivo */}
      <SectionTitle>Partidos en vivo</SectionTitle>
      {live.isLoading ? (
        <Loading />
      ) : live.data && live.data.length > 0 ? (
        live.data.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)
      ) : (
        <Card><Empty>No hay partidos en vivo ahora</Empty></Card>
      )}
    </ScrollView>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card style={styles.statCard}>
      <IconBadge name={icon} color={color} size={16} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Muted style={{ fontSize: 11, textAlign: 'center' }}>{label}</Muted>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Card>
  );
}

function ResultRow({ r }: { r: ResultItem }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/match/${r.externalId}`)}
      style={({ pressed }) => [styles.resRow, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.resIcon, { backgroundColor: r.correct ? theme.colors.green + '22' : theme.colors.red + '22' }]}>
        <Text style={{ color: r.correct ? theme.colors.green : theme.colors.red, fontWeight: '800' }}>
          {r.correct ? '✓' : '✗'}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.resTeams} numberOfLines={1}>
          {r.home} {r.homeScore}-{r.awayScore} {r.away}
        </Text>
        <Muted style={{ fontSize: 11 }}>
          Pronóstico: {SHORT[r.predicted]} · Real: {SHORT[r.actual]}
        </Muted>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  stats: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 6 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statSub: { color: theme.colors.muted, fontSize: 10, marginTop: 1 },
  resRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 10 },
  resIcon: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  resTeams: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
});
