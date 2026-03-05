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

export default function SignupScreen() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', email: '',
    phone: '', password: '', confirmPassword: '', referralCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const success = await signup(form);
    setLoading(false);
    if (success) {
      router.replace('/(tabs)/dashboard');
    }
  };

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
      <LinearGradient colors={['#0A0A1A', '#0E0E2A', '#080818']} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.brand}>TopupAfrica</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of users and start using our VTU services today</Text>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input label="First Name" placeholder="John" value={form.firstName} onChangeText={(v) => update('firstName', v)} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Last Name" placeholder="Doe" value={form.lastName} onChangeText={(v) => update('lastName', v)} />
              </View>
            </View>

            <Input label="Username" placeholder="johndoe" value={form.username} onChangeText={(v) => update('username', v)} autoCapitalize="none" />
            <Input label="Email" placeholder="john@example.com" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Phone Number" placeholder="+234 123 456 7890" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
            <Input label="Password" placeholder="Create a strong password" value={form.password} onChangeText={(v) => update('password', v)} isPassword />
            <Input label="Confirm Password" placeholder="Confirm your password" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} isPassword />
            <Input label="Referral Code (Optional)" placeholder="Enter referral code" value={form.referralCode} onChangeText={(v) => update('referralCode', v)} autoCapitalize="characters" />

            <GradientButton title="Create Account" onPress={handleSignup} loading={loading} disabled={loading} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brand: { color: COLORS.purple, fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.textPrimary, fontSize: 26, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 24, lineHeight: 20 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  errorBanner: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: `${COLORS.error}20`, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: `${COLORS.error}40` },
  errorText: { color: COLORS.error, fontSize: 13, fontFamily: 'Nunito_500Medium' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  footerText: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  footerLink: { color: COLORS.purpleLight, fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
