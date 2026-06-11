import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLeagues, useStandings } from '@/hooks/useLeagues';
import { Card, Muted, Loading, Empty, SectionTitle } from '@/components/ui';
import { theme } from '@/lib/theme';
import { translateLeague } from '@/lib/leagues';
import type { League } from '@/types';

export default function Ligas() {
  const { data: leagues, isLoading } = useLeagues();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<League | null>(null);
  const standings = useStandings(selected?.externalId ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = leagues ?? [];
    if (!q) return list;
    return list.filter(
      (l) => translateLeague(l.name).toLowerCase().includes(q) || (l.country ?? '').toLowerCase().includes(q),
    );
  }, [leagues, query]);

  // Vista de tabla de posiciones de una liga
  if (selected) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Pressable onPress={() => setSelected(null)} style={styles.back}>
          <Ionicons name="chevron-back" size={18} color={theme.colors.primary} />
          <Text style={styles.backText}>Ligas</Text>
        </Pressable>

        <View style={styles.leagueHead}>
          {selected.logo ? <Image source={selected.logo} style={styles.headLogo} /> : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.headName} numberOfLines={1}>{translateLeague(selected.name)}</Text>
            <Muted style={{ fontSize: 12 }}>{selected.country}</Muted>
          </View>
        </View>

        <SectionTitle>Tabla de posiciones</SectionTitle>
        {standings.isLoading ? (
          <Loading />
        ) : standings.data && standings.data.length > 0 ? (
          <Card>
            <View style={styles.tHead}>
              <Text style={[styles.tCol, { width: 22 }]}>#</Text>
              <Text style={[styles.tCol, { flex: 1 }]}>Equipo</Text>
              <Text style={[styles.tCol, styles.num]}>PJ</Text>
              <Text style={[styles.tCol, styles.num]}>DG</Text>
              <Text style={[styles.tCol, styles.num, { color: theme.colors.text, fontWeight: '800' }]}>Pts</Text>
            </View>
            {standings.data.map((s) => (
              <View key={s.team.id} style={[styles.tRow, s.rank <= 4 && styles.qualify]}>
                <Text style={[styles.tCol, { width: 22, color: theme.colors.muted }]}>{s.rank}</Text>
                <View style={styles.teamCell}>
                  {s.team.logo ? <Image source={s.team.logo} style={styles.teamLogo} /> : null}
                  <Text style={styles.teamName} numberOfLines={1}>{s.team.name}</Text>
                </View>
                <Text style={[styles.tCol, styles.num]}>{s.played}</Text>
                <Text style={[styles.tCol, styles.num]}>{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</Text>
                <Text style={[styles.tCol, styles.num, styles.pts]}>{s.points}</Text>
              </View>
            ))}
          </Card>
        ) : (
          <Card><Empty>No hay tabla disponible para esta temporada.</Empty></Card>
        )}
      </ScrollView>
    );
  }

  // Lista de ligas
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={theme.colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar liga o país…"
          placeholderTextColor={theme.colors.muted}
        />
        {query ? <Ionicons name="close" size={16} color={theme.colors.muted} onPress={() => setQuery('')} /> : null}
      </View>

      {isLoading ? (
        <Loading label="Cargando ligas…" />
      ) : filtered.length > 0 ? (
        <View style={{ gap: 8 }}>
          {filtered.map((l) => (
            <Pressable
              key={l.externalId}
              onPress={() => setSelected(l)}
              style={({ pressed }) => [styles.leagueRow, pressed && { opacity: 0.7 }]}
            >
              {l.logo ? <Image source={l.logo} style={styles.leagueLogo} /> : <View style={styles.leagueLogo} />}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.leagueName} numberOfLines={1}>{translateLeague(l.name)}</Text>
                <Muted style={{ fontSize: 11 }}>{l.country}</Muted>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Card><Empty>No se encontraron ligas.</Empty></Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 12 },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 10 },
  leagueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  leagueLogo: { width: 28, height: 28 },
  leagueName: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  backText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  leagueHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headLogo: { width: 40, height: 40 },
  headName: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  tHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 4 },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 2, borderRadius: 6 },
  qualify: { backgroundColor: theme.colors.primaryDim },
  tCol: { color: theme.colors.muted, fontSize: 12 },
  num: { width: 30, textAlign: 'center' },
  pts: { color: theme.colors.text, fontWeight: '800' },
  teamCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  teamLogo: { width: 18, height: 18 },
  teamName: { color: theme.colors.text, fontSize: 13, flexShrink: 1 },
});
