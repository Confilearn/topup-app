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
import { ResultModal } from '@/components/services/ResultModal';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const insets = useSafeAreaInsets();

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setShowResult(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
      <LinearGradient colors={['#0A0A1A', '#0E0E2A', '#080818']} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <View style={{ width: 36 }} />
          <Text style={styles.brand}>TopupAfrica</Text>
          <View style={styles.sunIcon}>
            <Ionicons name="sunny" size={22} color={COLORS.warning} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <GradientButton
              title="Send Reset Link"
              onPress={handleReset}
              loading={loading}
              disabled={loading || !email}
            />

            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ResultModal
        visible={showResult}
        type="success"
        title="Email Sent!"
        message={`A password reset link has been sent to ${email}. Check your inbox.`}
        onClose={() => { setShowResult(false); router.back(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { flexGrow: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 },
  brand: { color: COLORS.purple, fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  sunIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: COLORS.border },
  title: { color: COLORS.textPrimary, fontSize: 26, fontFamily: 'Nunito_800ExtraBold', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  form: { gap: 16 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: { color: COLORS.purpleLight, fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
});
