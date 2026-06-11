import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { NeuralBg } from '@/components/NeuralBg';
import { Card, Muted } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isPremium = !!user?.isPremium;

  return (
    <View style={{ flex: 1 }}>
      <NeuralBg />
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Card>
          <Text style={styles.cardTitle}>Cuenta</Text>
          <Row label="Nombre" value={user?.name ?? '—'} />
          <Row label="Correo" value={user?.email ?? '—'} />
          <View style={styles.row}>
            <Muted>Plan</Muted>
            <View style={[styles.planChip, { borderColor: isPremium ? theme.colors.gold : theme.colors.border }]}>
              {isPremium ? <MaterialCommunityIcons name="crown" size={13} color={theme.colors.gold} /> : null}
              <Text style={[styles.planChipText, { color: isPremium ? theme.colors.gold : theme.colors.muted }]}>
                {isPremium ? 'Premium' : 'Gratis'}
              </Text>
            </View>
          </View>
        </Card>

        <Pressable onPress={() => router.push('/premium')} style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.8 }]}>
          <MaterialCommunityIcons name="crown" size={20} color={theme.colors.gold} />
          <Text style={styles.menuText}>{isPremium ? 'Mi suscripción' : 'Hazte Premium'}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
        </Pressable>

        <Pressable style={({ pressed }) => [styles.logout, pressed && { opacity: 0.8 }]} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Muted>{label}</Muted>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  value: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  planChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  planChipText: { fontSize: 12, fontWeight: '800' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, padding: 14 },
  menuText: { flex: 1, color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  logout: { backgroundColor: theme.colors.danger, borderRadius: theme.radius.md, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
