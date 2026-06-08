import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWorldCup } from '@/hooks/usePredictions';
import { Card, Muted, Loading, Empty } from '@/components/ui';
import { theme, outcomeColor, outcomeLabel } from '@/lib/theme';
import { topScorelines } from '@/lib/scores';
import type { WorldCupGroup } from '@/types';

export default function Mundial() {
  const { data, isLoading } = useWorldCup();
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.table.some((r) => r.team.name.toLowerCase().includes(q)) ||
        g.matches.some((m) => m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q)),
    );
  }, [data, query]);

  if (isLoading) return <View style={styles.screen}><Loading label="Cargando Mundial…" /></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar selección o grupo… (ej: Colombia)"
          placeholderTextColor={theme.colors.muted}
        />
        {query ? <Ionicons name="close" size={16} color={theme.colors.muted} onPress={() => setQuery('')} /> : null}
      </View>

      {groups.length === 0 ? (
        <Card><Empty>No se encontró “{query}”.</Empty></Card>
      ) : (
        groups.map((g) => <GroupCard key={g.name} group={g} />)
      )}
    </ScrollView>
  );
}

function GroupCard({ group }: { group: WorldCupGroup }) {
  const router = useRouter();
  return (
    <Card>
      <Text style={styles.groupTitle}>🏆 {group.name}</Text>

      {/* Tabla proyectada */}
      <View style={{ marginTop: 8 }}>
        {group.table.map((r, i) => (
          <View key={r.team.id} style={[styles.tableRow, i < 2 && styles.qualify]}>
            <Text style={styles.pos}>{i + 1}</Text>
            {r.team.logo ? <Image source={r.team.logo} style={styles.tlogo} /> : <View style={styles.tlogo} />}
            <Text style={styles.tname} numberOfLines={1}>{r.team.name}</Text>
            <Text style={styles.pj}>{r.played}</Text>
            <Text style={styles.pts}>{r.points}</Text>
          </View>
        ))}
        <Muted style={{ fontSize: 10, marginTop: 4 }}>Tabla proyectada · los 2 primeros clasifican</Muted>
      </View>

      {/* Partidos */}
      <View style={styles.matches}>
        {group.matches.map((m) => {
          const p = m.prediction;
          const score = p && p.expectedHomeGoals != null && p.expectedAwayGoals != null
            ? topScorelines(p.expectedHomeGoals, p.expectedAwayGoals, 1)[0]?.label
            : 'vs';
          return (
            <Pressable key={m.id} onPress={() => router.push(`/match/${m.externalId}`)} style={({ pressed }) => [styles.matchRow, pressed && { opacity: 0.7 }]}>
              <Text style={styles.mteam} numberOfLines={1}>{m.homeTeam.name}</Text>
              <Text style={styles.mscore}>{score}</Text>
              <Text style={[styles.mteam, { textAlign: 'right' }]} numberOfLines={1}>{m.awayTeam.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 10 },
  groupTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 4, borderRadius: 6 },
  qualify: { backgroundColor: theme.colors.primaryDim },
  pos: { color: theme.colors.muted, fontSize: 12, width: 16 },
  tlogo: { width: 18, height: 18 },
  tname: { color: theme.colors.text, fontSize: 13, flex: 1 },
  pj: { color: theme.colors.muted, fontSize: 12, width: 24, textAlign: 'center' },
  pts: { color: theme.colors.text, fontSize: 13, fontWeight: '800', width: 28, textAlign: 'center' },
  matches: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 4 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  mteam: { color: theme.colors.text, fontSize: 12, flex: 1 },
  mscore: { color: theme.colors.text, fontSize: 12, fontWeight: '800', minWidth: 34, textAlign: 'center' },
});
