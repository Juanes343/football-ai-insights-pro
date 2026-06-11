import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { theme, statusLabel } from '@/lib/theme';
import { translateLeague } from '@/lib/leagues';
import type { Match } from '@/types';

export function MatchCard({ match }: { match: Match }) {
  const router = useRouter();
  const isLive = match.status === 'LIVE';
  const hasScore = match.homeScore != null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, isLive && styles.live, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/match/${match.externalId}`)}
    >
      <View style={styles.header}>
        <Text style={styles.league} numberOfLines={1}>
          {translateLeague(match.league?.name)}
        </Text>
        <Text style={[styles.status, { color: isLive ? theme.colors.red : theme.colors.muted }]}>
          {isLive && match.minute ? `${match.minute}'` : statusLabel(match.status)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.team}>
          {match.homeTeam.logo ? <Image source={match.homeTeam.logo} style={styles.logo} /> : null}
          <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam.name}</Text>
        </View>

        <View style={styles.middle}>
          {hasScore ? (
            <Text style={styles.score}>{match.homeScore} - {match.awayScore}</Text>
          ) : (
            <Text style={styles.time}>{match.startTime ? format(new Date(match.startTime), 'HH:mm') : 'vs'}</Text>
          )}
        </View>

        <View style={[styles.team, { justifyContent: 'flex-end' }]}>
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{match.awayTeam.name}</Text>
          {match.awayTeam.logo ? <Image source={match.awayTeam.logo} style={styles.logo} /> : null}
        </View>
      </View>

      {match.prediction ? (
        <View style={styles.predBar}>
          <View style={{ flex: match.prediction.homeWinProb, backgroundColor: theme.colors.green }} />
          <View style={{ flex: match.prediction.drawProb, backgroundColor: theme.colors.yellow }} />
          <View style={{ flex: match.prediction.awayWinProb, backgroundColor: theme.colors.blue }} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  live: { borderColor: 'rgba(255,84,112,0.45)', borderLeftWidth: 3, borderLeftColor: theme.colors.red },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  league: { color: theme.colors.muted, fontSize: 11, flex: 1 },
  status: { fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  team: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamName: { color: theme.colors.text, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  logo: { width: 22, height: 22 },
  middle: { paddingHorizontal: 10, minWidth: 56, alignItems: 'center' },
  score: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  time: { color: theme.colors.muted, fontSize: 13 },
  predBar: { flexDirection: 'row', height: 6, borderRadius: 999, overflow: 'hidden', marginTop: 10 },
});
