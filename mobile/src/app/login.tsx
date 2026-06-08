import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/lib/theme';
import { APP_NAME } from '@/lib/config';

export default function Login() {
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>⚽</Text>
        </View>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta de {APP_NAME}</Text>

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
          <Text style={styles.error}>{(loginMutation.error as Error)?.message ?? 'Credenciales inválidas'}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          disabled={loginMutation.isPending}
          onPress={() => loginMutation.mutate({ email, password })}
        >
          <Text style={styles.buttonText}>{loginMutation.isPending ? 'Ingresando…' : 'Iniciar sesión'}</Text>
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
  logo: { alignSelf: 'center', width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.primaryDim, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 28 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 12 },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#04210f', fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
