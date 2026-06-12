import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/api';
import { NeuralBg } from '@/components/NeuralBg';
import { theme } from '@/lib/theme';

const LOGO = require('../../assets/images/logo.png');

export default function Login() {
  const { loginMutation, googleSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <NeuralBg />
      <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={LOGO} style={styles.logoImg} contentFit="contain" />
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
        <View style={styles.passwordWrap}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.muted}
          />
          <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
          </Pressable>
        </View>

        <Link href={'/forgot-password' as any} style={styles.forgot}>¿Olvidaste tu contraseña?</Link>

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

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>o</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={async () => {
            const r = await googleSignIn();
            if (r.error) Alert.alert('Google', r.error);
          }}
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.googleText}>Continuar con Google</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>¿No tienes cuenta? </Text>
          <Link href="/register" style={styles.link}>Crea una</Link>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  forgot: { color: theme.colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'right', marginTop: 10 },
  brandWrap: { alignItems: 'center', marginBottom: 24, gap: 10 },
  logoImg: { width: 168, height: 168, borderRadius: 28 },
  tagline: { color: theme.colors.muted, fontSize: 12 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 13, color: theme.colors.text },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingRight: 8 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, color: theme.colors.text },
  eyeBtn: { padding: 8 },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 12 },
  button: { borderRadius: theme.radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  buttonText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { color: theme.colors.muted, fontSize: 12 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: theme.radius.md, paddingVertical: 14, marginTop: 18 },
  googleText: { color: '#1f1f1f', fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
