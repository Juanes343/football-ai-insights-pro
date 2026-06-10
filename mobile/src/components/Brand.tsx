import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '@/lib/theme';

const LOGO = require('../../assets/images/logo.png');

/** Marca ProSoccer AI: insignia (logo real) + wordmark bicolor. */
export function Brand({ size = 18, mark = true }: { size?: number; mark?: boolean }) {
  return (
    <View style={styles.row}>
      {mark ? (
        <Image
          source={LOGO}
          style={{ width: size * 1.7, height: size * 1.7, borderRadius: size * 0.45 }}
          contentFit="contain"
        />
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
  word: { fontWeight: '900', letterSpacing: 0.3 },
});
