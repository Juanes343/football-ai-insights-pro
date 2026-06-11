import { ScrollView, View, Text, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTopPredictions, useTodayPredictions } from '@/hooks/usePredictions';
import { Card, Muted, Loading, Empty } from '@/components/ui';
import { theme, outcomeColor, outcomeLabel, pct } from '@/lib/theme';
import type { Prediction } from '@/types';

export default function Predictions() {
  const top = useTopPredictions();
  const today = useTodayPredictions();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={top.isRefetching || today.isRefetching} onRefresh={() => { top.refetch(); today.refetch(); }} tintColor={theme.colors.primary} />}
    >
      <Text style={styles.h2}>Pronósticos de alta confianza</Text>
      {top.isLoading ? <Loading /> : top.data && top.data.length > 0 ? (
        top.data.map((p) => <PredRow key={p.id} p={p} />)
      ) : (
        <Card><Empty>Aún no hay predicciones de alta confianza.</Empty></Card>
      )}

      <Text style={styles.h2}>Todas las predicciones de hoy</Text>
      {today.isLoading ? <Loading /> : today.data && today.data.length > 0 ? (
        today.data.map((p) => <PredRow key={p.id} p={p} />)
      ) : (
        <Card><Empty>Aún no hay predicciones para hoy.</Empty></Card>
      )}
    </ScrollView>
  );
}

function PredRow({ p }: { p: Prediction }) {
  const router = useRouter();
  const m = p.match;
  return (
    <Pressable
      onPress={() => m && router.push(`/match/${m.externalId}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.match} numberOfLines={1}>
          {m ? `${m.homeTeam.name} vs ${m.awayTeam.name}` : 'Partido'}
        </Text>
        <Muted style={{ fontSize: 11 }}>{outcomeLabel(p.predictedOutcome)}</Muted>
      </View>
      <Text style={[styles.conf, { color: outcomeColor(p.predictedOutcome) }]}>{pct(p.confidence)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  h2: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  match: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  conf: { fontSize: 16, fontWeight: '800' },
});
