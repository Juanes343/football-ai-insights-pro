import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, RefreshControl, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMatchesByDate } from '@/hooks/useMatches';
import { MatchCard } from '@/components/MatchCard';
import { Loading, Empty, Card } from '@/components/ui';
import { theme } from '@/lib/theme';
import { translateLeague } from '@/lib/leagues';
import type { Match } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Ligas destacadas (externalId de API-Football), en orden de prioridad
const FEATURED = [1, 2, 3, 848, 39, 140, 135, 78, 61, 71, 128, 253, 239, 13, 11, 9, 4, 5, 10];

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';
const FILTERS: { v: StatusFilter; label: string }[] = [
  { v: 'all', label: 'Todos' },
  { v: 'live', label: 'En vivo' },
  { v: 'upcoming', label: 'Por jugar' },
  { v: 'finished', label: 'Finalizados' },
];

function byQuery(m: Match, q: string) {
  if (!q) return true;
  const t = q.toLowerCase();
  return m.homeTeam.name.toLowerCase().includes(t) || m.awayTeam.name.toLowerCase().includes(t) || translateLeague(m.league.name).toLowerCase().includes(t);
}
function byStatus(m: Match, f: StatusFilter) {
  if (f === 'all') return true;
  if (f === 'upcoming') return m.status === 'SCHEDULED';
  if (f === 'live') return m.status === 'LIVE';
  return m.status === 'FINISHED';
}

interface LeagueGroup { externalId: number; name: string; country: string; logo: string | null; matches: Match[] }

export default function Matches() {
  const [offset, setOffset] = useState(0); // días desde hoy
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const selectedDate = addDays(new Date(), offset);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const day = useMatchesByDate(dateStr);

  const groups = useMemo(() => {
    const list = (day.data ?? []).filter((m) => byQuery(m, query) && byStatus(m, filter));
    const map = new Map<number, LeagueGroup>();
    for (const m of list) {
      const id = m.league?.externalId ?? 0;
      if (!map.has(id)) map.set(id, { externalId: id, name: m.league?.name ?? '', country: m.league?.country ?? '', logo: m.league?.logo ?? null, matches: [] });
      map.get(id)!.matches.push(m);
    }
    const all = Array.from(map.values());
    all.forEach((g) => g.matches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
    const featured = all
      .filter((g) => FEATURED.includes(g.externalId))
      .sort((a, b) => FEATURED.indexOf(a.externalId) - FEATURED.indexOf(b.externalId));
    const rest = all
      .filter((g) => !FEATURED.includes(g.externalId))
      .sort((a, b) => b.matches.length - a.matches.length || a.name.localeCompare(b.name));
    return { featured, rest, total: list.length };
  }, [day.data, query, filter]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, gap: 14 }}
      refreshControl={<RefreshControl refreshing={day.isRefetching} onRefresh={() => day.refetch()} tintColor={theme.colors.primary} />}
    >
      {/* Tira de fechas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
        {Array.from({ length: 12 }).map((_, i) => {
          const off = i - 2;
          const d = addDays(new Date(), off);
          const active = off === offset;
          return (
            <Pressable key={off} onPress={() => setOffset(off)} style={[styles.dateChip, active && styles.dateChipActive]}>
              <Text style={[styles.dateDow, active && styles.dateActiveText]}>
                {off === 0 ? 'Hoy' : format(d, 'EEE', { locale: es })}
              </Text>
              <Text style={[styles.dateNum, active && styles.dateActiveText]}>{format(d, 'd MMM', { locale: es })}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Buscador */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder="Buscar equipo o liga…" placeholderTextColor={theme.colors.muted} />
        {query ? <Ionicons name="close" size={16} color={theme.colors.muted} onPress={() => setQuery('')} /> : null}
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f.v} onPress={() => setFilter(f.v)} style={[styles.chip, filter === f.v && styles.chipActive]}>
            <Text style={[styles.chipText, filter === f.v && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {day.isLoading ? (
        <Loading label="Cargando partidos…" />
      ) : groups.total === 0 ? (
        <Card><Empty>{query || filter !== 'all' ? 'Sin coincidencias.' : 'No hay partidos para esta fecha.'}</Empty></Card>
      ) : (
        <View style={{ gap: 14 }}>
          {groups.featured.length > 0 ? (
            <View style={{ gap: 8 }}>
              <View style={styles.secHead}>
                <Ionicons name="star" size={15} color={theme.colors.gold} />
                <Text style={styles.secTitle}>Ligas destacadas</Text>
              </View>
              {groups.featured.map((g) => <LeagueGroupRow key={g.externalId} group={g} defaultOpen />)}
            </View>
          ) : null}

          {groups.rest.length > 0 ? (
            <View style={{ gap: 8 }}>
              <View style={styles.secHead}>
                <Ionicons name="trophy" size={15} color={theme.colors.primary} />
                <Text style={styles.secTitle}>Ligas</Text>
              </View>
              {groups.rest.map((g) => <LeagueGroupRow key={g.externalId} group={g} />)}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

function LeagueGroupRow({ group, defaultOpen }: { group: LeagueGroup; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const hasLive = group.matches.some((m) => m.status === 'LIVE');
  return (
    <View>
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setOpen((o) => !o);
        }}
        style={({ pressed }) => [styles.leagueRow, pressed && { opacity: 0.8 }]}
      >
        {group.logo ? <Image source={group.logo} style={styles.leagueLogo} /> : <View style={styles.leagueLogo} />}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.leagueName} numberOfLines={1}>{translateLeague(group.name)}</Text>
          <Text style={styles.leagueCountry} numberOfLines={1}>{group.country}</Text>
        </View>
        {hasLive ? <View style={styles.liveDot} /> : null}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{group.matches.length}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.muted} />
      </Pressable>
      {open ? <View style={{ marginTop: 8 }}>{group.matches.map((m) => <MatchCard key={m.id} match={m} />)}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  dates: { gap: 8, paddingRight: 8 },
  dateChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card, minWidth: 58 },
  dateChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dateDow: { color: theme.colors.muted, fontSize: 11, textTransform: 'capitalize' },
  dateNum: { color: theme.colors.text, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  dateActiveText: { color: theme.colors.onPrimary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 10 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.card },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.muted, fontSize: 12 },
  chipTextActive: { color: theme.colors.onPrimary, fontWeight: '700' },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
  leagueRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  leagueLogo: { width: 26, height: 26 },
  leagueName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  leagueCountry: { color: theme.colors.muted, fontSize: 11 },
  liveDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: theme.colors.red },
  countBadge: { minWidth: 24, height: 24, borderRadius: 999, backgroundColor: theme.colors.primaryDim, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
});
