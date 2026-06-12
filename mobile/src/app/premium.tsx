import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NeuralBg } from '@/components/NeuralBg';
import { Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import { initPurchases, getPackages, purchase, restore, purchasesAvailable, type RCPackage } from '@/lib/purchases';
import { theme } from '@/lib/theme';

const BENEFITS = [
  { t: 'Análisis avanzado con IA', d: 'En ligas destacadas y el Mundial 2026.' },
  { t: 'Top AI sin límite', d: 'Las mejores predicciones de alta confianza, sin tope diario.' },
  { t: 'Mercados completos', d: 'Córners, faltas, tarjetas, remates, goles y ambos marcan con riesgo y cuota.' },
  { t: 'Análisis y tendencia', d: 'Explicación de cada pronóstico + tendencia de gol.' },
  { t: 'Sin publicidad', d: 'Experiencia limpia y enfocada.' },
];

const PLANS = [
  { id: 'weekly', name: 'Semanal', price: '$20.000', period: '/semana' },
  { id: 'monthly', name: 'Mensual', price: '$50.000', period: '/mes', best: true },
];

const WHATSAPP = '573000000000'; // TODO: reemplazar por el número real de soporte

export default function Premium() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isPremium = !!user?.isPremium;
  const [packages, setPackages] = useState<RCPackage[]>([]);
  const [busy, setBusy] = useState(false);
  const billing = purchasesAvailable();
  const [loadingPkgs, setLoadingPkgs] = useState(billing);

  useEffect(() => {
    if (!billing) return;
    (async () => {
      setLoadingPkgs(true);
      await initPurchases(user?.id);
      setPackages(await getPackages());
      setLoadingPkgs(false);
    })();
  }, [billing, user?.id]);

  const markPremium = () => {
    if (user) useAuthStore.getState().setUser({ ...user, isPremium: true, role: 'PREMIUM' });
    qc.invalidateQueries({ queryKey: ['me'] });
  };

  const soon = () =>
    Alert.alert('Próximamente', 'Los pagos in-app estarán disponibles muy pronto. Estamos finalizando la integración con la tienda.');

  const onBuy = async (pkg: RCPackage) => {
    try {
      setBusy(true);
      const ok = await purchase(pkg);
      if (ok) {
        markPremium();
        Alert.alert('¡Listo! 👑', 'Ya eres Premium. ¡Disfruta el acceso completo!');
      }
    } catch {
      Alert.alert('Error', 'No se pudo completar la compra. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (!billing) return soon();
    try {
      setBusy(true);
      const ok = await restore();
      if (ok) {
        markPremium();
        Alert.alert('Compras restauradas', 'Tu suscripción Premium está activa de nuevo.');
      } else {
        Alert.alert('Sin compras', 'No encontramos una suscripción activa para restaurar.');
      }
    } catch {
      Alert.alert('Error', 'No se pudieron restaurar las compras.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <NeuralBg />
      <Stack.Screen options={{ title: 'Premium' }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="crown" size={14} color={theme.colors.onPrimary} />
            <Text style={styles.badgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.heroTitle}>
            Acceso exclusivo a la información que marca la <Text style={{ color: theme.colors.primary }}>diferencia</Text>
          </Text>
          {isPremium ? <Text style={styles.active}>✓ Ya eres Premium</Text> : null}
        </View>

        {/* Beneficios */}
        <Card>
          {BENEFITS.map((b, i) => (
            <View key={i} style={[styles.benefit, i > 0 && { marginTop: 12 }]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.green} />
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitT}>{b.t}</Text>
                <Text style={styles.benefitD}>{b.d}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Planes */}
        {isPremium ? null : billing && loadingPkgs ? (
          <View style={[styles.plans, { justifyContent: 'center', paddingVertical: 30 }]}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{ color: theme.colors.muted, marginLeft: 10 }}>Cargando planes…</Text>
          </View>
        ) : billing && packages.length > 0 ? (
          <View style={styles.plans}>
            {packages.map((p, i) => {
              const best = p.period === '/mes' || (packages.length === 2 && i === 1);
              return (
                <View key={p.id} style={[styles.plan, best && styles.planBest]}>
                  {best ? <Text style={styles.bestTag}>MÁS POPULAR</Text> : null}
                  <Text style={styles.planName}>{p.title} <MaterialCommunityIcons name="crown" size={14} color={theme.colors.gold} /></Text>
                  <Text style={styles.planPrice}>{p.priceString}</Text>
                  <Text style={styles.planPeriod}>{p.period}</Text>
                  <Pressable disabled={busy} onPress={() => onBuy(p)} style={({ pressed }) => [pressed && { opacity: 0.85 }, { marginTop: 10 }]}>
                    <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subBtn}>
                      <Text style={styles.subBtnText}>Suscribirse</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.plans}>
            {PLANS.map((p) => (
              <View key={p.id} style={[styles.plan, p.best && styles.planBest]}>
                {p.best ? <Text style={styles.bestTag}>MÁS POPULAR</Text> : null}
                <Text style={styles.planName}>{p.name} <MaterialCommunityIcons name="crown" size={14} color={theme.colors.gold} /></Text>
                <Text style={styles.planPrice}>{p.price}</Text>
                <Text style={styles.planPeriod}>{p.period}</Text>
                <Pressable onPress={soon} style={({ pressed }) => [pressed && { opacity: 0.85 }, { marginTop: 10 }]}>
                  <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subBtn}>
                    <Text style={styles.subBtnText}>Suscribirse</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {busy ? <ActivityIndicator color={theme.colors.primary} /> : null}

        <Pressable onPress={onRestore} style={({ pressed }) => [styles.restore, pressed && { opacity: 0.7 }]}>
          <Ionicons name="refresh" size={16} color={theme.colors.text} />
          <Text style={styles.restoreText}>Restaurar compras</Text>
        </Pressable>

        <Text style={styles.legalNote}>
          La suscripción se renueva automáticamente. Cancela cuando quieras desde tu tienda. El cobro se hace a tu cuenta de la tienda.
        </Text>

        <View style={styles.links}>
          <Text style={styles.link} onPress={() => Linking.openURL('https://prosocceria.app/terminos')}>Términos de uso</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://prosocceria.app/privacidad')}>Política de privacidad</Text>
        </View>

        <Pressable
          onPress={() => Linking.openURL(`https://wa.me/${WHATSAPP}`)}
          style={({ pressed }) => [styles.whatsapp, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={styles.whatsappText}>Contáctanos por WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 10, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.colors.gold, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: theme.colors.onPrimary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 28 },
  active: { color: theme.colors.green, fontWeight: '800' },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  benefitT: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  benefitD: { color: theme.colors.muted, fontSize: 12, marginTop: 1, lineHeight: 17 },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  promoInput: { flex: 1, backgroundColor: theme.colors.cardAlt, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 12, paddingVertical: 11, color: theme.colors.text },
  plans: { flexDirection: 'row', gap: 12 },
  plan: { flex: 1, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.lg, padding: 14, alignItems: 'center' },
  planBest: { borderColor: theme.colors.gold },
  bestTag: { color: theme.colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 0.5, marginBottom: 4 },
  planName: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
  planPrice: { color: theme.colors.primary, fontSize: 22, fontWeight: '900', marginTop: 6 },
  planPeriod: { color: theme.colors.muted, fontSize: 11 },
  subBtn: { borderRadius: theme.radius.md, paddingVertical: 11, paddingHorizontal: 18, alignItems: 'center' },
  subBtnText: { color: theme.colors.onPrimary, fontWeight: '800', fontSize: 14 },
  restore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingVertical: 13 },
  restoreText: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
  legalNote: { color: theme.colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  link: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  dot: { color: theme.colors.muted },
  whatsapp: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderColor: '#25D366', borderWidth: 1, borderRadius: theme.radius.md, paddingVertical: 13, marginBottom: 16 },
  whatsappText: { color: '#25D366', fontWeight: '800', fontSize: 14 },
});
