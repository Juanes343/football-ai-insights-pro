import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, GradientButton } from './ui';
import { theme } from '@/lib/theme';

export function PaywallCard({
  title = 'Contenido Premium',
  subtitle = 'Los mercados (córners, faltas, tarjetas, remates), el análisis y el Top AI son exclusivos de ProSoccer AI Premium.',
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  return (
    <Card accent="gold">
      <View style={styles.center}>
        <MaterialCommunityIcons name="crown" size={36} color={theme.colors.gold} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
        <GradientButton gold label="Hazte Premium 👑" onPress={() => router.push('/premium')} style={styles.btn} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 8, paddingVertical: 6 },
  title: { color: theme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 4 },
  sub: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  btn: { marginTop: 10, alignSelf: 'stretch' },
});
