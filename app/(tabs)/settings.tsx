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
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { ResultModal } from '@/components/services/ResultModal';
import { PinModal } from '@/components/services/PinModal';
import { MOCK_PASSWORD } from '@/lib/mockData';

export default function SettingsScreen() {
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
  const [newPin, setNewPin] = useState('');
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
    setResult({ type: 'success', title: 'Profile Updated!', message: 'Your profile information has been updated successfully.' });
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
    setShowPinModal(true);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <View style={styles.topBar}>
          <Pressable>
            <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.brandName}>TopupAfrica</Text>
          <Pressable>
            <Ionicons name="sunny" size={22} color={COLORS.warning} />
          </Pressable>
        </View>

        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Manage your account settings and security</Text>

        {/* Personal Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient colors={['#7C3AED', '#3B82F6']} style={styles.headerIcon}>
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.cardTitle}>Personal Information</Text>
              <Text style={styles.cardSubtitle}>Update your personal details</Text>
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

        {/* Security Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.headerIcon, { backgroundColor: `${COLORS.error}30` }]}>
              <Ionicons name="shield" size={20} color={COLORS.error} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Security Settings</Text>
              <Text style={styles.cardSubtitle}>Manage your account security</Text>
            </View>
          </View>

          <View style={styles.securityList}>
            <Pressable
              style={styles.secItem}
              onPress={() => setShowPinModal(true)}
            >
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.secItemTitle}>Transaction PIN</Text>
                <Text style={styles.secItemSub}>Set up your 4-digit PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.secItem} onPress={() => {}}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.secItemTitle}>Change Password</Text>
                <Text style={styles.secItemSub}>Update your login password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.secItem} onPress={() => setShowResetPin(true)}>
              <Ionicons name="lock-open-outline" size={20} color={COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.secItemTitle}>Reset Transaction PIN</Text>
                <Text style={styles.secItemSub}>Reset your PIN using current password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Change Password Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <View style={styles.form}>
            <Input label="Current Password" placeholder="Enter current password" value={pwForm.current} onChangeText={(v) => setPwForm((f) => ({ ...f, current: v }))} isPassword />
            <Input label="New Password" placeholder="Enter new password" value={pwForm.newPw} onChangeText={(v) => setPwForm((f) => ({ ...f, newPw: v }))} isPassword />
            <Input label="Confirm New Password" placeholder="Confirm new password" value={pwForm.confirm} onChangeText={(v) => setPwForm((f) => ({ ...f, confirm: v }))} isPassword />
            <GradientButton title="Change Password" onPress={handleChangePassword} />
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <Text style={styles.cardSubtitle}>Your account details</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
              <View>
                <Text style={styles.infoLabel}>Date Joined</Text>
                <Text style={styles.infoValue}>{user?.joinDate}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
              <View>
                <Text style={styles.infoLabel}>Account Status</Text>
                <Text style={[styles.infoValue, { color: COLORS.success }]}>{user?.accountStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme */}
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <View style={styles.themeLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? COLORS.blue : COLORS.warning} />
              <View>
                <Text style={styles.cardTitle}>Dark Mode</Text>
                <Text style={styles.cardSubtitle}>{isDark ? 'Dark theme enabled' : 'Light theme enabled'}</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ false: COLORS.border, true: COLORS.purple }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.8 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Reset PIN with password verify */}
      {showResetPin && (
        <View style={styles.overlay}>
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Verify Password</Text>
            <Text style={styles.verifySub}>Enter your account password to reset PIN</Text>
            <Input
              label="Password"
              placeholder="Enter your password"
              value={verifyPassword}
              onChangeText={setVerifyPassword}
              isPassword
            />
            <View style={styles.verifyBtns}>
              <GradientButton title="Verify" onPress={handleVerifyForPinReset} variant="outline" style={{ flex: 1 }} />
              <GradientButton title="Cancel" onPress={() => setShowResetPin(false)} variant="ghost" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      )}

      <PinModal
        visible={showPinModal}
        title="Set Transaction PIN"
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          setShowPinModal(false);
          setResult({ type: 'success', title: 'PIN Set!', message: 'Your transaction PIN has been set successfully.' });
        }}
      />

      {result && (
        <ResultModal
          visible={!!result}
          type={result.type}
          title={result.title}
          message={result.message}
          onClose={() => setResult(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandName: { color: COLORS.purple, fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: COLORS.textPrimary, fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: COLORS.textPrimary, fontSize: 17, fontFamily: 'Nunito_700Bold' },
  cardSubtitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  form: { gap: 14 },
  securityList: { gap: 0 },
  secItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  secItemTitle: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  secItemSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  divider: { height: 1, backgroundColor: COLORS.border },
  infoList: { gap: 14 },
  infoItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  infoValue: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: `${COLORS.error}15`, borderRadius: 14, borderWidth: 1, borderColor: `${COLORS.error}35`, marginBottom: 20 },
  logoutText: { color: COLORS.error, fontSize: 16, fontFamily: 'Nunito_700Bold' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 },
  verifyCard: { backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 24, width: '100%', gap: 14 },
  verifyTitle: { color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Nunito_700Bold' },
  verifySub: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  verifyBtns: { flexDirection: 'row', gap: 10 },
});
