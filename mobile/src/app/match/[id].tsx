import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { format } from 'date-fns';
import { useMatch } from '@/hooks/useMatches';
import { useMatchPrediction } from '@/hooks/usePredictions';
import { PredictionCard } from '@/components/PredictionCard';
import { MarketsList } from '@/components/Markets';
import { NeuralBg } from '@/components/NeuralBg';
import { ConfidenceRing, ProbBars1X2 } from '@/components/Charts';
import { Card, Loading, Empty, Muted } from '@/components/ui';
import { theme, statusLabel, outcomeLabel } from '@/lib/theme';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const externalId = parseInt(id ?? '0', 10);
  const match = useMatch(externalId);
  const prediction = useMatchPrediction(externalId);

  return (
    <View style={{ flex: 1 }}>
      <NeuralBg />
      <Stack.Screen options={{ title: 'Partido' }} />
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {match.isLoading ? (
          <Loading />
        ) : !match.data ? (
          <Card><Empty>Partido no encontrado.</Empty></Card>
        ) : (
          <Card>
            <Text style={styles.status}>
              {match.data.status === 'LIVE' && match.data.minute ? `${match.data.minute}' · ` : ''}
              {statusLabel(match.data.status)}
            </Text>
            <View style={styles.scoreRow}>
              <Team name={match.data.homeTeam.name} logo={match.data.homeTeam.logo} />
              <View style={styles.scoreMid}>
                <Text style={styles.score}>
                  {match.data.homeScore ?? '–'} : {match.data.awayScore ?? '–'}
                </Text>
                {match.data.startTime ? (
                  <Muted style={{ fontSize: 11, marginTop: 4 }}>
                    {format(new Date(match.data.startTime), 'dd/MM HH:mm')}
                  </Muted>
                ) : null}
              </View>
              <Team name={match.data.awayTeam.name} logo={match.data.awayTeam.logo} />
            </View>
            <Muted style={{ textAlign: 'center', marginTop: 8, fontSize: 11 }}>{match.data.league?.name}</Muted>
          </Card>
        )}

        {prediction.isLoading ? (
          <Loading label="Analizando partido…" />
        ) : prediction.data ? (
          <>
            {/* IA Confidence + 1X2 */}
            <Card accent="cyan">
              <View style={styles.confRow}>
                <ConfidenceRing value={prediction.data.confidence} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.confTitle}>IA CONFIDENCE</Text>
                  <Muted style={{ fontSize: 11 }}>Confianza del modelo</Muted>
                  <View style={styles.predChip}>
                    <Text style={styles.predChipText}>{outcomeLabel(prediction.data.predictedOutcome)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <ProbBars1X2
                home={prediction.data.homeWinProb}
                draw={prediction.data.drawProb}
                away={prediction.data.awayWinProb}
                predicted={prediction.data.predictedOutcome}
              />
            </Card>

            {/* Análisis general */}
            {prediction.data.analysis ? (
              <Card>
                <Text style={styles.sectionTitle}>🧠 Análisis general</Text>
                <Text style={styles.analysis}>{prediction.data.analysis}</Text>
              </Card>
            ) : null}

            {/* Mercados / pronósticos */}
            {prediction.data.markets && prediction.data.markets.length > 0 ? (
              <View>
                <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>📊 Pronósticos</Text>
                <MarketsList markets={prediction.data.markets} />
                <Muted style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                  Las probabilidades son estimadas por IA y pueden variar.
                </Muted>
              </View>
            ) : null}

            {/* Detalle del modelo (1X2, marcador, 2ª opinión) */}
            <PredictionCard prediction={prediction.data} />
          </>
        ) : (
          <Card><Empty>Sin predicción disponible.</Empty></Card>
        )}
      </ScrollView>
    </View>
  );
}

function Team({ name, logo }: { name: string; logo: string | null }) {
  return (
    <View style={styles.team}>
      {logo ? <Image source={logo} style={styles.logo} /> : null}
      <Text style={styles.teamName} numberOfLines={2}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  confTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  predChip: { alignSelf: 'flex-start', marginTop: 4, backgroundColor: theme.colors.primaryDim, borderColor: theme.colors.primary, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  predChipText: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 14 },
  status: { color: theme.colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  logo: { width: 56, height: 56 },
  teamName: { color: theme.colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  scoreMid: { alignItems: 'center', paddingHorizontal: 8 },
  score: { color: theme.colors.text, fontSize: 32, fontWeight: '800' },
  sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  analysis: { color: theme.colors.text, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
