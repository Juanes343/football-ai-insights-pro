import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorldCup } from '@/hooks/usePredictions';
import { Card, Muted, Loading, Empty } from '@/components/ui';
import { theme, outcomeLabel, outcomeColor } from '@/lib/theme';
import { topScorelines } from '@/lib/scores';
import type { WorldCupGroup, Match } from '@/types';

/** Fecha LOCAL (yyyy-MM-dd) del partido, para que coincida con la hora mostrada. */
const localDate = (iso?: string) => (iso ? format(new Date(iso), 'yyyy-MM-dd') : '');

export default function Mundial() {
  const { data, isLoading } = useWorldCup();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<string | null>(null); // null = vista por grupos

  const allMatches = useMemo(() => (data ?? []).flatMap((g) => g.matches), [data]);
  const dates = useMemo(() => {
    const set = new Set<string>();
    allMatches.forEach((m) => {
      const d = localDate(m.startTime);
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [allMatches]);

  const q = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!data) return [];
    if (!q) return data;
    return data.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.table.some((r) => r.team.name.toLowerCase().includes(q)) ||
        g.matches.some((m) => m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q)),
    );
  }, [data, q]);

  const dateMatches = useMemo(() => {
    if (!date) return [];
    return allMatches
      .filter(
        (m) =>
          localDate(m.startTime) === date &&
          (!q || m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q)),
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allMatches, date, q]);

  if (isLoading) return <View style={styles.screen}><Loading label="Cargando Mundial…" /></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Buscador */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar selección o grupo…"
          placeholderTextColor={theme.colors.muted}
        />
        {query ? <Ionicons name="close" size={16} color={theme.colors.muted} onPress={() => setQuery('')} /> : null}
      </View>

      {/* Filtro por fecha */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <DateChip active={date === null} label="Grupos" onPress={() => setDate(null)} />
        {dates.map((d) => (
          <DateChip
            key={d}
            active={date === d}
            label={format(new Date(d + 'T12:00:00'), 'EEE d', { locale: es })}
            onPress={() => setDate(d)}
          />
        ))}
      </ScrollView>

      {/* Vista por fecha */}
      {date ? (
        dateMatches.length > 0 ? (
          <View style={{ gap: 8 }}>
            <Muted style={{ textTransform: 'capitalize' }}>
              {format(new Date(date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })} · {dateMatches.length} partidos
            </Muted>
            {dateMatches.map((m) => <DateMatchRow key={m.id} m={m} />)}
          </View>
        ) : (
          <Card><Empty>No hay partidos ese día{q ? ' con ese filtro' : ''}.</Empty></Card>
        )
      ) : groups.length === 0 ? (
        <Card><Empty>No se encontró “{query}”.</Empty></Card>
      ) : (
        groups.map((g) => <GroupCard key={g.name} group={g} />)
      )}
    </ScrollView>
  );
}

function DateChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function DateMatchRow({ m }: { m: Match }) {
  const router = useRouter();
  const p = m.prediction;
  const score = p && p.expectedHomeGoals != null && p.expectedAwayGoals != null
    ? topScorelines(p.expectedHomeGoals, p.expectedAwayGoals, 1)[0]?.label
    : 'vs';
  const conf = p ? Math.round(Math.max(p.homeWinProb, p.drawProb, p.awayWinProb) * 100) : null;

  return (
    <Pressable onPress={() => router.push(`/match/${m.externalId}`)} style={({ pressed }) => [styles.matchCard, pressed && { opacity: 0.75 }]}>
      <View style={styles.matchTop}>
        <Text style={styles.time}>{m.startTime ? format(new Date(m.startTime), 'HH:mm') : ''}</Text>
        {p ? (
          <Text style={[styles.outcome, { color: outcomeColor(p.predictedOutcome) }]}>
            {outcomeLabel(p.predictedOutcome)} · {conf}%
          </Text>
        ) : null}
      </View>
      <View style={styles.matchRow}>
        <View style={styles.teamL}>
          {m.homeTeam.logo ? <Image source={m.homeTeam.logo} style={styles.logo} /> : null}
          <Text style={styles.teamName} numberOfLines={1}>{m.homeTeam.name}</Text>
        </View>
        <Text style={styles.score}>{score}</Text>
        <View style={styles.teamR}>
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{m.awayTeam.name}</Text>
          {m.awayTeam.logo ? <Image source={m.awayTeam.logo} style={styles.logo} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function GroupCard({ group }: { group: WorldCupGroup }) {
  const router = useRouter();
  return (
    <Card>
      <Text style={styles.groupTitle}>🏆 {group.name}</Text>
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
      <View style={styles.matches}>
        {group.matches.map((m) => {
          const p = m.prediction;
          const score = p && p.expectedHomeGoals != null && p.expectedAwayGoals != null
            ? topScorelines(p.expectedHomeGoals, p.expectedAwayGoals, 1)[0]?.label
            : 'vs';
          return (
            <Pressable key={m.id} onPress={() => router.push(`/match/${m.externalId}`)} style={({ pressed }) => [styles.gMatchRow, pressed && { opacity: 0.7 }]}>
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
  chips: { gap: 8, paddingRight: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: theme.colors.onPrimary, fontWeight: '800' },
  // Date match card
  matchCard: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  matchTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  time: { color: theme.colors.muted, fontSize: 11 },
  outcome: { fontSize: 11, fontWeight: '700' },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  teamL: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamR: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  logo: { width: 24, height: 24 },
  teamName: { color: theme.colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  score: { color: theme.colors.text, fontSize: 17, fontWeight: '800', minWidth: 44, textAlign: 'center' },
  // Group card
  groupTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 4, borderRadius: 6 },
  qualify: { backgroundColor: theme.colors.primaryDim },
  pos: { color: theme.colors.muted, fontSize: 12, width: 16 },
  tlogo: { width: 18, height: 18 },
  tname: { color: theme.colors.text, fontSize: 13, flex: 1 },
  pj: { color: theme.colors.muted, fontSize: 12, width: 24, textAlign: 'center' },
  pts: { color: theme.colors.text, fontSize: 13, fontWeight: '800', width: 28, textAlign: 'center' },
  matches: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 4 },
  gMatchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  mteam: { color: theme.colors.text, fontSize: 12, flex: 1 },
  mscore: { color: theme.colors.text, fontSize: 12, fontWeight: '800', minWidth: 34, textAlign: 'center' },
});
