import { View, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/lib/theme';

type Accent = 'cyan' | 'gold' | undefined;

export function Card({ children, style, accent }: { children: React.ReactNode; style?: ViewStyle; accent?: Accent }) {
  return (
    <View style={[styles.card, style]}>
      {accent ? (
        <LinearGradient
          colors={accent === 'gold' ? theme.gradients.gold : theme.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentTop}
        />
      ) : null}
      {children}
    </View>
  );
}

export function Muted({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

/** Encabezado de sección con barra de acento dorada. */
export function SectionTitle({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <View style={styles.section}>
      <View style={[styles.accentBar, { backgroundColor: gold ? theme.colors.gold : theme.colors.primary }]} />
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

export function GradientButton({
  label,
  onPress,
  gold,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  gold?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [pressed && { opacity: 0.85 }, style]}>
      <LinearGradient
        colors={gold ? theme.gradients.gold : theme.gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gbtn}
      >
        <Text style={styles.gbtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function Chip({ label, color, filled }: { label: string; color: string; filled?: boolean }) {
  return (
    <View style={[styles.chip, { borderColor: color, backgroundColor: filled ? color + '22' : 'transparent' }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

/** Círculo con ícono tintado (para stats / encabezados). */
export function IconBadge({ name, color, size = 18 }: { name: keyof typeof Ionicons.glyphMap; color: string; size?: number }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: color + '22' }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.colors.primary} />
      {label ? <Muted style={{ marginTop: 8 }}>{label}</Muted> : null}
    </View>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.center}>
      <Muted>{children}</Muted>
    </View>
  );
}

export function Bar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  accentTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  section: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  accentBar: { width: 4, height: 18, borderRadius: 999 },
  sectionText: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
  gbtn: { borderRadius: theme.radius.md, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  gbtnText: { color: theme.colors.onPrimary, fontSize: 14, fontWeight: '800' },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  chipText: { fontSize: 10, fontWeight: '800' },
  iconBadge: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  barTrack: { flex: 1, height: 8, borderRadius: 999, backgroundColor: theme.colors.cardAlt, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
});
