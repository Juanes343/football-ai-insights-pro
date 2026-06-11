import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Path, Line as SvgLine } from 'react-native-svg';
import { theme, outcomeColor } from '@/lib/theme';
import type { PredictionOutcome } from '@/types';

/** Anillo de IA Confidence: progreso circular cian con % al centro y cerebro. */
export function ConfidenceRing({
  value,
  size = 92,
  stroke = 9,
  brain = true,
  tone = 'auto',
}: {
  value: number;
  size?: number;
  stroke?: number;
  brain?: boolean;
  tone?: 'auto' | 'cyan' | 'gold';
}) {
  const pct = Math.max(0, Math.min(1, value));
  const gold = tone === 'gold' || (tone === 'auto' && pct >= 0.75);
  const c1 = gold ? theme.colors.goldDark : theme.colors.primary;
  const c2 = gold ? theme.colors.gold : theme.colors.neural;
  const accent = gold ? theme.colors.gold : theme.colors.neural;
  const gid = gold ? 'psai-ring-gold' : 'psai-ring-cyan';
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={c1} />
            <Stop offset="100%" stopColor={c2} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.cardAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        {brain ? <MaterialCommunityIcons name="brain" size={size * 0.2} color={accent} /> : null}
        <Text style={{ color: accent, fontSize: size * 0.26, fontWeight: '900' }}>{Math.round(pct * 100)}%</Text>
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

/**
 * Mini-gráfico de tendencia (estilo TradingView): área con degradado + línea
 * + glow + punto final. `values` en 0..1. `gold` para tramo de alto valor.
 */
export function TrendChart({
  values,
  height = 130,
  gold = false,
  xLabels,
}: {
  values: number[];
  height?: number;
  gold?: boolean;
  xLabels?: string[];
}) {
  const { width: winW } = useWindowDimensions();
  const w = Math.max(220, winW - 64); // ancho de la tarjeta (padding pantalla 16 + card 16)
  const padY = 14;
  const h = height;
  const color = gold ? theme.colors.gold : theme.colors.neural;
  const n = values.length;
  if (n < 2) return null;

  const x = (i: number) => (i / (n - 1)) * w;
  const y = (v: number) => h - padY - Math.max(0, Math.min(1, v)) * (h - padY * 2);

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const last = values[n - 1];

  return (
    <View>
      <Svg width={w} height={h}>
        <Defs>
          <SvgGradient id="psai-area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </SvgGradient>
        </Defs>
        {/* líneas guía */}
        {[0.25, 0.5, 0.75].map((g) => (
          <SvgLine key={g} x1={0} y1={y(g)} x2={w} y2={y(g)} stroke={theme.colors.border} strokeWidth={1} strokeDasharray="3 5" />
        ))}
        <Path d={area} fill="url(#psai-area)" />
        <Path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={x(n - 1)} cy={y(last)} r={5} fill={color} />
        <Circle cx={x(n - 1)} cy={y(last)} r={9} fill={color} opacity={0.2} />
      </Svg>
      {xLabels && xLabels.length > 0 ? (
        <View style={styles.xRow}>
          {xLabels.map((l, i) => (
            <Text key={i} style={styles.xLabel}>{l}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  xRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  xLabel: { color: theme.colors.muted, fontSize: 10 },
  col: { flex: 1, alignItems: 'center', gap: 5 },
  pct: { fontSize: 17, fontWeight: '800' },
  pctActive: { fontSize: 19, fontWeight: '900' },
  track: { width: '100%', height: 6, borderRadius: 999, backgroundColor: theme.colors.cardAlt, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, shadowOpacity: 0.7, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  label: { color: theme.colors.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
});

// helper opcional para color de outcome (re-export)
export { outcomeColor };
