import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { apiErrorMessage } from '@/lib/api';
import { theme } from '@/lib/theme';

const LOGO = require('../../assets/images/logo.png');

export default function Register() {
  const { registerMutation } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.brandWrap}>
          <Image source={LOGO} style={styles.logoImg} contentFit="contain" />
        </View>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Comienza tu experiencia con ProSoccer AI</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={theme.colors.muted} />
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="tucorreo@ejemplo.com" placeholderTextColor={theme.colors.muted} />
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordWrap}>
          <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="Mín. 8 caracteres" placeholderTextColor={theme.colors.muted} />
          <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={10} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.muted} />
          </Pressable>
        </View>

        {registerMutation.isError ? (
          <Text style={styles.error}>{apiErrorMessage(registerMutation.error, 'No se pudo crear la cuenta')}</Text>
        ) : null}

        <Pressable
          disabled={registerMutation.isPending}
          onPress={() => registerMutation.mutate({ name, email, password })}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
            <Text style={styles.buttonText}>{registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}</Text>
          </LinearGradient>
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
  brandWrap: { alignItems: 'center', marginBottom: 12 },
  logoImg: { width: 96, height: 96, borderRadius: 18 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: theme.colors.muted, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radius.md, paddingRight: 8 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text },
  eyeBtn: { padding: 8 },
  error: { color: theme.colors.danger, fontSize: 13, marginTop: 12 },
  button: { borderRadius: theme.radius.md, paddingVertical: 15, alignItems: 'center', marginTop: 22 },
  buttonText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
});
