import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.replace('/(tabs)/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: topPad, paddingBottom: botPad }]}>
      {colors.bgPrimary === '#080818' && (
        <LinearGradient colors={['#0A0A1A', '#0E0E2A', '#080818']} style={StyleSheet.absoluteFill} />
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.brand, { color: colors.purple }]}>TopupAfrica</Text>
          <View style={styles.iconBtn}>
            <Ionicons name="sunny" size={22} color={colors.warning} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to your account to continue</Text>

          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: `${colors.error}20`, borderColor: `${colors.error}40` }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <Input label="Email" placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Password" placeholder="Enter your password (hint: password123)" value={password} onChangeText={setPassword} isPassword />

            <Pressable onPress={() => router.push('/(auth)/reset-password')} style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.purpleLight }]}>Forgot password?</Text>
            </Pressable>

            <GradientButton title="Sign In" onPress={handleLogin} loading={loading} disabled={loading} />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={[styles.footerLink, { color: colors.purpleLight }]}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  card: { borderRadius: 24, padding: 28, borderWidth: 1 },
  title: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  form: { gap: 16 },
  errorBanner: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: 'Nunito_500Medium', flex: 1 },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: 'Nunito_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
