import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import { NeuralBg } from '@/components/NeuralBg';
import { theme } from '@/lib/theme';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch {
      /* por seguridad mostramos el mismo mensaje */
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <NeuralBg />
      <Stack.Screen options={{ title: 'Recuperar contraseña' }} />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed-outline" size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Recuperar contraseña</Text>

        {sent ? (
          <>
            <Text style={styles.subtitle}>
              Si existe una cuenta con ese correo, te enviamos instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.
            </Text>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
              </LinearGradient>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</Text>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor={theme.colors.muted}
            />
            <Pressable disabled={loading} onPress={submit} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Enviando…' : 'Enviar enlace'}</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 4 },
  iconWrap: { alignSelf: 'center', width: 64, height: 64, borderRadius: 999, backgroundColor: theme.colors.primaryDim, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 16, lineHeight: 19 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 13, color: theme.colors.text },
  button: { borderRadius: theme.radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  buttonText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '800' },
});
