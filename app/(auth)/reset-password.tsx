import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useTheme';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { ResultModal } from '@/components/services/ResultModal';

export default function ResetPasswordScreen() {
  const colors = useColors();
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
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
            <GradientButton title="Send Reset Link" onPress={handleReset} loading={loading} disabled={loading || !email} />
            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={[styles.backLinkText, { color: colors.purpleLight }]}>Back to Sign In</Text>
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
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold' },
  card: { borderRadius: 24, padding: 28, borderWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 28, textAlign: 'center', lineHeight: 22 },
  form: { gap: 16 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
});
