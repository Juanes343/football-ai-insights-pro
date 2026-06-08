import { View, Text, StyleSheet } from 'react-native';
import { Card, Muted, Bar } from './ui';
import { theme, outcomeColor, outcomeLabel, pct } from '@/lib/theme';
import { topScorelines, translateAdvice } from '@/lib/scores';
import type { Prediction, PredictionComparison } from '@/types';

const COMP_LABELS: Record<keyof PredictionComparison, string> = {
  form: 'Forma',
  att: 'Ataque',
  def: 'Defensa',
  poisson_distribution: 'Poisson',
  h2h: 'H2H',
  goals: 'Goles',
  total: 'Total',
};

export function PredictionCard({ prediction: p }: { prediction: Prediction }) {
  const isApi = p.provider === 'api';
  const rows = [
    { label: 'Gana local', value: Math.round(p.homeWinProb * 100), color: theme.colors.green },
    { label: 'Empate', value: Math.round(p.drawProb * 100), color: theme.colors.yellow },
    { label: 'Gana visitante', value: Math.round(p.awayWinProb * 100), color: theme.colors.blue },
  ];
  const scores =
    p.expectedHomeGoals != null && p.expectedAwayGoals != null
      ? topScorelines(p.expectedHomeGoals, p.expectedAwayGoals, 3)
      : [];

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{isApi ? 'Predicción API-Football' : 'Predicción IA propia'}</Text>
      </View>

      {/* Resultado */}
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <Text style={[styles.outcome, { color: outcomeColor(p.predictedOutcome) }]}>
          {outcomeLabel(p.predictedOutcome)}
        </Text>
        <Muted>{pct(p.confidence)} de confianza</Muted>
      </View>

      {/* Barras de probabilidad */}
      <View style={{ gap: 6 }}>
        {rows.map((r) => (
          <View key={r.label} style={styles.barRow}>
            <Text style={styles.barLabel}>{r.label}</Text>
            <Bar value={r.value} color={r.color} />
            <Text style={styles.barVal}>{r.value}%</Text>
          </View>
        ))}
      </View>

      {/* xG / BTTS / Over */}
      <View style={styles.stats}>
        <Stat label="xG" value={`${p.expectedHomeGoals?.toFixed(1) ?? '–'} – ${p.expectedAwayGoals?.toFixed(1) ?? '–'}`} />
        <Stat label="Ambos marcan" value={pct(p.btts)} />
        <Stat label="+2.5 goles" value={pct(p.over25)} />
      </View>

      {/* Marcador más probable */}
      {scores.length > 0 ? (
        <View style={styles.scoreBox}>
          <Muted>⚽ Marcador más probable</Muted>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={styles.scoreBig}>{scores[0].label}</Text>
            <Muted>({pct(scores[0].prob)})</Muted>
          </View>
          <Muted style={{ marginTop: 2 }}>
            Alternativas: {scores.slice(1).map((s) => `${s.label} (${pct(s.prob)})`).join('  ·  ')}
          </Muted>
        </View>
      ) : null}

      {/* Consejo */}
      {p.advice ? (
        <View style={styles.advice}>
          <Muted>Consejo</Muted>
          <Text style={styles.adviceText}>{translateAdvice(p.advice)}</Text>
        </View>
      ) : null}

      {/* Comparativa */}
      {p.comparison ? <Comparison comparison={p.comparison} /> : null}

      {/* Segunda opinión */}
      {p.secondOpinion ? (
        <View style={styles.second}>
          <Muted>🤖 Segunda opinión — nuestra IA</Muted>
          <View style={styles.secondHead}>
            <Text style={[styles.secondOutcome, { color: outcomeColor(p.secondOpinion.predictedOutcome) }]}>
              {outcomeLabel(p.secondOpinion.predictedOutcome)}
            </Text>
            <Muted>{pct(p.secondOpinion.confidence)} de confianza</Muted>
          </View>
          <Muted style={{ marginTop: 4 }}>
            L {Math.round(p.secondOpinion.homeWinProb * 100)}%  ·  E {Math.round(p.secondOpinion.drawProb * 100)}%  ·  V {Math.round(p.secondOpinion.awayWinProb * 100)}%
          </Muted>
          <Text style={{ color: p.secondOpinion.predictedOutcome === p.predictedOutcome ? theme.colors.green : theme.colors.yellow, fontSize: 11, marginTop: 4 }}>
            {p.secondOpinion.predictedOutcome === p.predictedOutcome
              ? '✓ Coincide con la predicción principal'
              : `⚠ Difiere: se inclina por "${outcomeLabel(p.secondOpinion.predictedOutcome)}"`}
          </Text>
        </View>
      ) : null}

      <Text style={styles.source}>{isApi ? 'Fuente: API-Football' : `Nuestro modelo ${p.modelVersion ?? ''}`}</Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Muted style={{ fontSize: 11 }}>{label}</Muted>
      <Text style={styles.statVal}>{value}</Text>
    </View>
  );
}

function Comparison({ comparison }: { comparison: PredictionComparison }) {
  const keys = (Object.keys(COMP_LABELS) as (keyof PredictionComparison)[]).filter(
    (k) => comparison[k]?.home && comparison[k]?.away,
  );
  if (keys.length === 0) return null;
  return (
    <View style={styles.comp}>
      <Muted>Comparativa</Muted>
      {keys.map((k) => {
        const home = parseFloat(comparison[k]!.home) || 0;
        const away = parseFloat(comparison[k]!.away) || 0;
        const total = home + away || 1;
        return (
          <View key={k} style={styles.compRow}>
            <Text style={styles.compNum}>{Math.round(home)}</Text>
            <View style={styles.compBar}>
              <View style={{ flex: home / total, backgroundColor: theme.colors.green }} />
              <View style={{ flex: away / total, backgroundColor: theme.colors.blue }} />
            </View>
            <Text style={styles.compNum}>{Math.round(away)}</Text>
            <Text style={styles.compLabel}>{COMP_LABELS[k]}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  outcome: { fontSize: 20, fontWeight: '800' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { color: theme.colors.muted, fontSize: 12, width: 92 },
  barVal: { color: theme.colors.text, fontSize: 12, width: 36, textAlign: 'right' },
  stats: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  statVal: { color: theme.colors.text, fontSize: 14, fontWeight: '700', marginTop: 2 },
  scoreBox: { marginTop: 12, backgroundColor: theme.colors.cardAlt, borderRadius: theme.radius.md, padding: 10 },
  scoreBig: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  advice: { marginTop: 12, backgroundColor: theme.colors.primaryDim, borderRadius: theme.radius.md, padding: 10 },
  adviceText: { color: theme.colors.text, fontSize: 13, marginTop: 2 },
  comp: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 6 },
  compRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compNum: { color: theme.colors.text, fontSize: 11, width: 24, textAlign: 'center' },
  compBar: { flex: 1, flexDirection: 'row', height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: theme.colors.cardAlt },
  compLabel: { color: theme.colors.muted, fontSize: 11, width: 56 },
  second: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
  secondHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  secondOutcome: { fontSize: 15, fontWeight: '700' },
  source: { color: theme.colors.muted, fontSize: 10, textAlign: 'right', marginTop: 10 },
});
