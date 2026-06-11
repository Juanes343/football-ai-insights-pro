import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLiveMatches, useMatchesByDate } from '@/hooks/useMatches';
import { MatchCard } from '@/components/MatchCard';
import { Loading, Empty, Card } from '@/components/ui';
import { theme } from '@/lib/theme';
import type { Match } from '@/types';

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';
const FILTERS: { v: StatusFilter; label: string }[] = [
  { v: 'all', label: 'Todos' },
  { v: 'upcoming', label: 'Por jugar' },
  { v: 'live', label: 'En vivo' },
  { v: 'finished', label: 'Finalizados' },
];

function byQuery(m: Match, q: string) {
  if (!q) return true;
  const t = q.toLowerCase();
  return m.homeTeam.name.toLowerCase().includes(t) || m.awayTeam.name.toLowerCase().includes(t) || m.league.name.toLowerCase().includes(t);
}
function byStatus(m: Match, f: StatusFilter) {
  if (f === 'all') return true;
  if (f === 'upcoming') return m.status === 'SCHEDULED';
  if (f === 'live') return m.status === 'LIVE';
  return m.status === 'FINISHED';
}

export default function Matches() {
  const [date, setDate] = useState(new Date());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

  const live = useLiveMatches();
  const day = useMatchesByDate(dateStr);

  const dayMatches = useMemo(
    () =>
      (day.data ?? [])
        .filter((m) => byQuery(m, query) && byStatus(m, filter))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [day.data, query, filter],
  );
  const upcoming = dayMatches.filter((m) => m.status === 'SCHEDULED');
  const others = dayMatches.filter((m) => m.status !== 'SCHEDULED');
  const liveFiltered = (live.data ?? []).filter((m) => byQuery(m, query));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      refreshControl={<RefreshControl refreshing={live.isRefetching || day.isRefetching} onRefresh={() => { live.refetch(); day.refetch(); }} tintColor={theme.colors.primary} />}
    >
      {/* Buscador */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar equipo o liga…"
          placeholderTextColor={theme.colors.muted}
        />
        {query ? <Ionicons name="close" size={16} color={theme.colors.muted} onPress={() => setQuery('')} /> : null}
      </View>

      {/* Filtros de estado */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f.v} onPress={() => setFilter(f.v)} style={[styles.chip, filter === f.v && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f.v && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* En vivo */}
      {(filter === 'all' || filter === 'live') && liveFiltered.length > 0 ? (
        <View>
          <Text style={[styles.h2, { color: theme.colors.red }]}>● EN VIVO AHORA ({liveFiltered.length})</Text>
          {liveFiltered.map((m) => <MatchCard key={m.id} match={m} />)}
        </View>
      ) : null}

      {/* Selector de fecha */}
      <View style={styles.dateRow}>
        <Pressable style={styles.dateBtn} onPress={() => setDate((d) => subDays(d, 1))}><Ionicons name="chevron-back" size={18} color={theme.colors.text} /></Pressable>
        <Text style={styles.dateText}>{isToday ? 'Hoy' : format(date, "EEE d 'de' MMM", { locale: es })}</Text>
        <Pressable style={styles.dateBtn} onPress={() => setDate((d) => addDays(d, 1))}><Ionicons name="chevron-forward" size={18} color={theme.colors.text} /></Pressable>
      </View>

      {day.isLoading ? (
        <Loading />
      ) : dayMatches.length > 0 ? (
        <View style={{ gap: 8 }}>
          {upcoming.length > 0 ? (
            <>
              <Text style={styles.h3}>⏳ Próximos {isToday ? 'de hoy' : ''} ({upcoming.length})</Text>
              {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
            </>
          ) : null}
          {others.length > 0 ? (
            <>
              <Text style={styles.h3}>{upcoming.length > 0 ? 'En juego / finalizados' : 'Partidos'} ({others.length})</Text>
              {others.map((m) => <MatchCard key={m.id} match={m} />)}
            </>
          ) : null}
        </View>
      ) : (
        <Card><Empty>{query || filter !== 'all' ? 'Sin coincidencias con el filtro.' : 'No hay partidos para esta fecha.'}</Empty></Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 10 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.muted, fontSize: 12 },
  chipTextActive: { color: '#04210f', fontWeight: '700' },
  h2: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  h3: { color: theme.colors.muted, fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 4 },
  dateBtn: { padding: 8, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  dateText: { color: theme.colors.text, fontSize: 14, fontWeight: '600', minWidth: 130, textAlign: 'center', textTransform: 'capitalize' },
});
