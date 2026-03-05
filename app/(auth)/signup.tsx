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

export default function SignupScreen() {
  const colors = useColors();
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
      setError('Please fill in all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    setError('');
    const success = await signup(form);
    setLoading(false);
    if (success) router.replace('/(tabs)/dashboard');
  };

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
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
          <View style={{ width: 36 }} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Join thousands of users and start using our VTU services today</Text>

          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: `${colors.error}20`, borderColor: `${colors.error}40` }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.row}>
              <View style={{ flex: 1 }}><Input label="First Name" placeholder="John" value={form.firstName} onChangeText={(v) => update('firstName', v)} /></View>
              <View style={{ flex: 1 }}><Input label="Last Name" placeholder="Doe" value={form.lastName} onChangeText={(v) => update('lastName', v)} /></View>
            </View>
            <Input label="Username" placeholder="johndoe" value={form.username} onChangeText={(v) => update('username', v)} autoCapitalize="none" />
            <Input label="Email" placeholder="john@example.com" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Phone Number" placeholder="+234 123 456 7890" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" />
            <Input label="Password" placeholder="Create a strong password" value={form.password} onChangeText={(v) => update('password', v)} isPassword />
            <Input label="Confirm Password" placeholder="Confirm your password" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} isPassword />
            <Input label="Referral Code (Optional)" placeholder="Enter referral code" value={form.referralCode} onChangeText={(v) => update('referralCode', v)} autoCapitalize="characters" />

            <GradientButton title="Create Account" onPress={handleSignup} loading={loading} disabled={loading} />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>Already have an account? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={[styles.footerLink, { color: colors.purpleLight }]}>Sign in</Text>
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
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  card: { borderRadius: 24, padding: 28, borderWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 24, lineHeight: 20 },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  errorBanner: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: 'Nunito_500Medium', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: 'Nunito_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
