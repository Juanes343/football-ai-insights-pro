import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { theme, outcomeColor } from '@/lib/theme';
import type { PredictionOutcome } from '@/types';

/** Anillo de IA Confidence: progreso circular cian con % al centro y cerebro. */
export function ConfidenceRing({
  value,
  size = 92,
  stroke = 9,
  brain = true,
}: {
  value: number;
  size?: number;
  stroke?: number;
  brain?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="psai-ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.colors.primary} />
            <Stop offset="100%" stopColor={theme.colors.neural} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.cardAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#psai-ring)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        {brain ? <MaterialCommunityIcons name="brain" size={size * 0.2} color={theme.colors.neural} /> : null}
        <Text style={{ color: theme.colors.text, fontSize: size * 0.26, fontWeight: '900' }}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  );
}

/** Barras 1X2 estilo mockup: Local / Empate / Visitante con % y barra luminosa. */
export function ProbBars1X2({
  home,
  draw,
  away,
  predicted,
}: {
  home: number;
  draw: number;
  away: number;
  predicted?: PredictionOutcome;
}) {
  const items: { key: PredictionOutcome; label: string; v: number; color: string }[] = [
    { key: 'HOME_WIN', label: 'LOCAL', v: home, color: theme.colors.green },
    { key: 'DRAW', label: 'EMPATE', v: draw, color: theme.colors.gold },
    { key: 'AWAY_WIN', label: 'VISITANTE', v: away, color: theme.colors.primary },
  ];
  return (
    <View style={styles.row}>
      {items.map((it) => {
        const active = predicted === it.key;
        return (
          <View key={it.key} style={styles.col}>
            <Text style={[styles.pct, { color: it.color }, active && styles.pctActive]}>{Math.round(it.v * 100)}%</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(it.v * 100)}%`, backgroundColor: it.color, shadowColor: it.color }]} />
            </View>
            <Text style={[styles.label, active && { color: it.color, fontWeight: '800' }]}>{it.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1, alignItems: 'center', gap: 5 },
  pct: { fontSize: 17, fontWeight: '800' },
  pctActive: { fontSize: 19, fontWeight: '900' },
  track: { width: '100%', height: 6, borderRadius: 999, backgroundColor: theme.colors.cardAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, shadowOpacity: 0.7, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  label: { color: theme.colors.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
});

// helper opcional para color de outcome (re-export)
export { outcomeColor };
