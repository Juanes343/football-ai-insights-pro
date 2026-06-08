import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useLiveMatches } from '@/hooks/useMatches';
import { useTopPredictions } from '@/hooks/usePredictions';
import { MatchCard } from '@/components/MatchCard';
import { PredictionCard } from '@/components/PredictionCard';
import { Card, Muted, Loading, Empty } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function Panel() {
  const live = useLiveMatches();
  const top = useTopPredictions();

  const refreshing = live.isRefetching || top.isRefetching;
  const onRefresh = () => {
    live.refetch();
    top.refetch();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    >
      {/* Stats */}
      <View style={styles.stats}>
        <Stat label="En vivo" value={live.data?.length ?? '—'} color={theme.colors.red} />
        <Stat label="Pronósticos" value={top.data?.length ?? '—'} color={theme.colors.primary} />
      </View>

      <Text style={styles.h2}>Partidos en vivo</Text>
      {live.isLoading ? (
        <Loading />
      ) : live.data && live.data.length > 0 ? (
        live.data.slice(0, 6).map((m) => <MatchCard key={m.id} match={m} />)
      ) : (
        <Card><Empty>No hay partidos en vivo ahora</Empty></Card>
      )}

      <Text style={styles.h2}>Mejor pronóstico</Text>
      {top.isLoading ? (
        <Loading />
      ) : top.data && top.data[0] ? (
        <PredictionCard prediction={top.data[0]} />
      ) : (
        <Card><Empty>Aún no hay predicciones</Empty></Card>
      )}
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Muted>{label}</Muted>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  stats: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  h2: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
});
