import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { format } from 'date-fns';
import { useMatch } from '@/hooks/useMatches';
import { useMatchPrediction } from '@/hooks/usePredictions';
import { PredictionCard } from '@/components/PredictionCard';
import { Card, Loading, Empty, Muted } from '@/components/ui';
import { theme, statusLabel } from '@/lib/theme';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const externalId = parseInt(id ?? '0', 10);
  const match = useMatch(externalId);
  const prediction = useMatchPrediction(externalId);

  return (
    <>
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
          <Loading label="Generando predicción…" />
        ) : prediction.data ? (
          <PredictionCard prediction={prediction.data} />
        ) : (
          <Card><Empty>Sin predicción disponible.</Empty></Card>
        )}
      </ScrollView>
    </>
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
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  status: { color: theme.colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  logo: { width: 56, height: 56 },
  teamName: { color: theme.colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  scoreMid: { alignItems: 'center', paddingHorizontal: 8 },
  score: { color: theme.colors.text, fontSize: 32, fontWeight: '800' },
});
