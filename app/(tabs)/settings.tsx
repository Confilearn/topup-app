import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { AppHeader } from '@/components/ui/AppHeader';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { ResultModal } from '@/components/services/ResultModal';
import { PinModal } from '@/components/services/PinModal';
import { MOCK_PASSWORD } from '@/lib/mockData';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showResetPin, setShowResetPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const handleUpdateProfile = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    updateProfile(profileForm);
    setLoading(false);
    setResult({ type: 'success', title: 'Profile Updated!', message: 'Your profile has been updated successfully.' });
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) return;
    if (pwForm.newPw !== pwForm.confirm) { setResult({ type: 'error', title: 'Password Mismatch', message: 'New passwords do not match.' }); return; }
    if (pwForm.current !== MOCK_PASSWORD) { setResult({ type: 'error', title: 'Wrong Password', message: 'Current password is incorrect.' }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setPwForm({ current: '', newPw: '', confirm: '' });
    setResult({ type: 'success', title: 'Password Changed!', message: 'Your password has been updated successfully.' });
  };

  const handleVerifyForPinReset = async () => {
    if (verifyPassword !== MOCK_PASSWORD) {
      setResult({ type: 'error', title: 'Wrong Password', message: 'Incorrect account password.' });
      return;
    }
    setShowResetPin(false);
    setVerifyPassword('');
    setShowPinModal(true);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <AppHeader />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile & Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Manage your account settings and security</Text>

        {/* Personal Info */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <LinearGradient colors={['#7C3AED', '#3B82F6']} style={styles.headerIcon}>
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Personal Information</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Update your personal details</Text>
            </View>
          </View>
          <View style={styles.form}>
            <Input label="First Name" value={profileForm.firstName} onChangeText={(v) => setProfileForm((f) => ({ ...f, firstName: v }))} />
            <Input label="Last Name" value={profileForm.lastName} onChangeText={(v) => setProfileForm((f) => ({ ...f, lastName: v }))} />
            <Input label="Email Address" value={profileForm.email} onChangeText={(v) => setProfileForm((f) => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
            <Input label="Phone Number" value={profileForm.phone} onChangeText={(v) => setProfileForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
            <GradientButton title="Update Profile" onPress={handleUpdateProfile} loading={loading} />
          </View>
        </View>

        {/* Security */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIcon, { backgroundColor: `${colors.error}25` }]}>
              <Ionicons name="shield" size={20} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Security Settings</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>Manage your account security</Text>
            </View>
          </View>
          <View style={styles.securityList}>
            {[
              { icon: 'lock-closed-outline', title: 'Transaction PIN', sub: 'Set up your 4-digit PIN', onPress: () => setShowPinModal(true) },
              { icon: 'lock-open-outline', title: 'Reset Transaction PIN', sub: 'Reset your PIN using current password', onPress: () => setShowResetPin(true) },
            ].map((item, i) => (
              <React.Fragment key={item.title}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <Pressable style={({ pressed }) => [styles.secItem, pressed && { opacity: 0.7 }]} onPress={item.onPress}>
                  <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.secItemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.secItemSub, { color: colors.textMuted }]}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Change Password */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Change Password</Text>
          <View style={styles.form}>
            <Input label="Current Password" placeholder="Enter current password" value={pwForm.current} onChangeText={(v) => setPwForm((f) => ({ ...f, current: v }))} isPassword />
            <Input label="New Password" placeholder="Enter new password" value={pwForm.newPw} onChangeText={(v) => setPwForm((f) => ({ ...f, newPw: v }))} isPassword />
            <Input label="Confirm New Password" placeholder="Confirm new password" value={pwForm.confirm} onChangeText={(v) => setPwForm((f) => ({ ...f, confirm: v }))} isPassword />
            <GradientButton title="Change Password" onPress={handleChangePassword} />
          </View>
        </View>

        {/* Account Info */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Account Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date Joined</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user?.joinDate}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Account Status</Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>{user?.accountStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme */}
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            <View style={[styles.themeIcon, { backgroundColor: isDark ? `${colors.blue}20` : `${colors.warning}20` }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? colors.blue : colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ false: colors.border, true: colors.purple }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: pressed ? `${colors.error}25` : `${colors.error}12`, borderColor: `${colors.error}35` },
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Reset PIN verify overlay */}
      {showResetPin && (
        <View style={styles.overlay}>
          <View style={[styles.verifyCard, { backgroundColor: colors.bgCard }]}>
            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>Verify Password</Text>
            <Text style={[styles.verifySub, { color: colors.textMuted }]}>Enter your account password to reset PIN</Text>
            <Input label="Password" placeholder="Enter your password (hint: password123)" value={verifyPassword} onChangeText={setVerifyPassword} isPassword />
            <View style={styles.verifyBtns}>
              <GradientButton title="Verify & Reset" onPress={handleVerifyForPinReset} style={{ flex: 1 }} />
              <GradientButton title="Cancel" onPress={() => { setShowResetPin(false); setVerifyPassword(''); }} variant="ghost" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      )}

      <PinModal visible={showPinModal} title="Set Transaction PIN" onClose={() => setShowPinModal(false)} onSuccess={() => { setShowPinModal(false); setResult({ type: 'success', title: 'PIN Set!', message: 'Your transaction PIN has been set successfully.' }); }} />

      {result && <ResultModal visible={!!result} type={result.type} title={result.title} message={result.message} onClose={() => setResult(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  card: { borderRadius: 18, padding: 20, gap: 16, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold' },
  cardSubtitle: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  form: { gap: 14 },
  securityList: {},
  secItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  secItemTitle: { fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  secItemSub: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  divider: { height: 1 },
  infoList: { gap: 14 },
  infoItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoLabel: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  infoValue: { fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  logoutText: { fontSize: 16, fontFamily: 'Nunito_700Bold' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 },
  verifyCard: { borderRadius: 24, padding: 24, width: '100%', gap: 14 },
  verifyTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  verifySub: { fontSize: 13, fontFamily: 'Nunito_400Regular' },
  verifyBtns: { flexDirection: 'row', gap: 10 },
});
