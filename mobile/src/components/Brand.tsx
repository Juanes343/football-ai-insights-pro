import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/lib/theme';

/** Marca ProSoccer AI: escudo con degradado + wordmark bicolor (como el logo). */
export function Brand({ size = 18, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <View style={styles.row}>
      {mark ? (
        <LinearGradient
          colors={theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.mark, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.45 }]}
        >
          <Text style={{ fontSize: size * 0.85 }}>⚽</Text>
        </LinearGradient>
      ) : null}
      <Text style={[styles.word, { fontSize: size }]}>
        <Text style={{ color: theme.colors.text }}>ProSoccer</Text>
        <Text style={{ color: theme.colors.primary }}> AI</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { alignItems: 'center', justifyContent: 'center' },
  word: { fontWeight: '900', letterSpacing: 0.3 },
});
