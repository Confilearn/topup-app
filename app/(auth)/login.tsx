import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
      <LinearGradient
        colors={['#0A0A1A', '#0E0E2A', '#080818']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.brand}>TopupAfrica</Text>
          <View style={styles.sunIcon}>
            <Ionicons name="sunny" size={22} color={COLORS.warning} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account to continue</Text>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />

            <Pressable onPress={() => router.push('/(auth)/reset-password')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <GradientButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: COLORS.purple,
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
  },
  sunIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: `${COLORS.error}20`,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.error}40`,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: COLORS.purpleLight,
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
  footerLink: {
    color: COLORS.purpleLight,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
});
