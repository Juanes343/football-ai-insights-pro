import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/lib/theme';
import type { Market, MarketGroup } from '@/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RISK_COLOR: Record<Market['risk'], string> = {
  Bajo: theme.colors.green,
  Medio: theme.colors.yellow,
  Alto: theme.colors.red,
};

const GROUP_ICON: Record<MarketGroup, keyof typeof Ionicons.glyphMap> = {
  Resultado: 'trophy-outline',
  Goles: 'football-outline',
  Córners: 'flag-outline',
  Faltas: 'hand-left-outline',
  Tarjetas: 'square-outline',
  Remates: 'locate-outline',
};

export function MarketsList({ markets }: { markets: Market[] }) {
  // Agrupar por categoría conservando el orden de aparición
  const groups: { name: MarketGroup; items: Market[] }[] = [];
  for (const m of markets) {
    let g = groups.find((x) => x.name === m.group);
    if (!g) {
      g = { name: m.group, items: [] };
      groups.push(g);
    }
    g.items.push(m);
  }

  return (
    <View style={{ gap: 16 }}>
      {groups.map((g) => (
        <View key={g.name}>
          <View style={styles.groupHeader}>
            <Ionicons name={GROUP_ICON[g.name]} size={15} color={theme.colors.primary} />
            <Text style={styles.groupTitle}>{g.name}</Text>
          </View>
          <View style={{ gap: 8 }}>
            {g.items.map((m) => <MarketRow key={m.key} m={m} />)}
          </View>
        </View>
      ))}
    </View>
  );
}

function MarketRow({ m }: { m: Market }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(m.probability * 100);
  const color = RISK_COLOR[m.risk];

  return (
    <Pressable
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((o) => !o);
      }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.label} numberOfLines={2}>{m.label}</Text>
        <View style={styles.oddsChip}>
          <Text style={styles.oddsText}>@{m.odds.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.pct, { color }]}>{pct}%</Text>
        <View style={[styles.riskBadge, { borderColor: color }]}>
          <Text style={[styles.riskText, { color }]}>{m.risk}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.muted} />
      </View>

      {open ? <Text style={styles.explanation}>{m.explanation}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  groupTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 12 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  oddsChip: { backgroundColor: theme.colors.cardAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  oddsText: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  barTrack: { flex: 1, height: 7, borderRadius: 999, backgroundColor: theme.colors.cardAlt, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  pct: { fontSize: 13, fontWeight: '800', width: 40, textAlign: 'right' },
  riskBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  riskText: { fontSize: 10, fontWeight: '700' },
  explanation: { color: theme.colors.muted, fontSize: 12, marginTop: 10, lineHeight: 17 },
});
