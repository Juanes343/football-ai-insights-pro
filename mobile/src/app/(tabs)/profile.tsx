import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Card, Muted } from '@/components/ui';
import { theme } from '@/lib/theme';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card>
        <Text style={styles.cardTitle}>Cuenta</Text>
        <Row label="Nombre" value={user?.name ?? '—'} />
        <Row label="Correo" value={user?.email ?? '—'} />
        <Row label="Rol" value={user?.role ?? '—'} />
      </Card>

      <Pressable style={({ pressed }) => [styles.logout, pressed && { opacity: 0.8 }]} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
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
  logout: { backgroundColor: theme.colors.danger, borderRadius: theme.radius.md, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
