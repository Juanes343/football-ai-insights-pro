import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/api';
import { theme } from '@/lib/theme';
import { Brand } from '@/components/Brand';

export default function Login() {
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brandWrap}>
          <Brand size={30} />
          <Text style={styles.tagline}>Análisis profesional de fútbol con IA</Text>
        </View>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>

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
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={theme.colors.muted}
        />

        {loginMutation.isError ? (
          <Text style={styles.error}>{apiErrorMessage(loginMutation.error, 'Credenciales inválidas')}</Text>
        ) : null}

        <Pressable
          disabled={loginMutation.isPending}
          onPress={() => loginMutation.mutate({ email, password })}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
            <Text style={styles.buttonText}>{loginMutation.isPending ? 'Ingresando…' : 'Iniciar sesión'}</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>¿No tienes cuenta? </Text>
          <Link href="/register" style={styles.link}>Crea una</Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  brandWrap: { alignItems: 'center', marginBottom: 24, gap: 8 },
  tagline: { color: theme.colors.muted, fontSize: 12 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 13, color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 12 },
  button: { borderRadius: theme.radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  buttonText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
