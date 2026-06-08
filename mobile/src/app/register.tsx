import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { theme } from '@/lib/theme';

export default function Register() {
  const { registerMutation } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Comienza tu experiencia de analítica futbolística</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={theme.colors.muted} />
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="tucorreo@ejemplo.com" placeholderTextColor={theme.colors.muted} />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Mín. 8 caracteres" placeholderTextColor={theme.colors.muted} />

        {registerMutation.isError ? (
          <Text style={styles.error}>{(registerMutation.error as Error)?.message ?? 'No se pudo crear la cuenta'}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          disabled={registerMutation.isPending}
          onPress={() => registerMutation.mutate({ name, email, password })}
        >
          <Text style={styles.buttonText}>{registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>¿Ya tienes una cuenta? </Text>
          <Link href="/login" style={styles.link}>Inicia sesión</Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 12 },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#04210f', fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
