import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { MOCK_REFERRALS, MOCK_USER } from '@/lib/mockData';
import { EmptyState } from '@/components/ui/EmptyState';

const STAT_CARDS = [
  { label: 'Total Referrals', value: String(MOCK_REFERRALS.totalReferrals), icon: 'people', color: COLORS.purple },
  { label: 'Total Earnings', value: `₦${MOCK_REFERRALS.totalEarnings.toLocaleString()}`, icon: 'wallet', color: COLORS.success },
  { label: 'Referral Bonus', value: `₦${MOCK_REFERRALS.referralBonus.toLocaleString()}`, icon: 'gift', color: COLORS.blue },
  { label: 'Pending Bonus', value: `₦${MOCK_REFERRALS.pendingBonus.toLocaleString()}`, icon: 'time', color: COLORS.warning },
];

export default function ReferralsScreen() {
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const copyLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', MOCK_USER.referralLink + ' copied to clipboard');
  };

  const shareLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Share', 'Share sheet would open here');
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

        <Text style={styles.title}>Referrals</Text>
        <Text style={styles.subtitle}>Earn rewards by inviting friends</Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STAT_CARDS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}20` }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Referral Link */}
        <View style={styles.linkCard}>
          <Text style={styles.sectionTitle}>Your Referral Link</Text>
          <View style={styles.linkBox}>
            <Ionicons name="link-outline" size={18} color={COLORS.purple} />
            <Text style={styles.linkText} numberOfLines={1}>
              {MOCK_USER.referralLink}
            </Text>
          </View>
          <View style={styles.linkActions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: `${COLORS.purple}20`, borderColor: COLORS.purple }]}
              onPress={copyLink}
            >
              <Ionicons name="copy-outline" size={16} color={COLORS.purpleLight} />
              <Text style={[styles.actionText, { color: COLORS.purpleLight }]}>Copy Link</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: `${COLORS.blue}20`, borderColor: COLORS.blue }]}
              onPress={shareLink}
            >
              <Ionicons name="share-outline" size={16} color={COLORS.blueLight} />
              <Text style={[styles.actionText, { color: COLORS.blueLight }]}>Share</Text>
            </Pressable>
          </View>

          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{MOCK_USER.referralCode}</Text>
              <Pressable onPress={copyLink}>
                <Ionicons name="copy-outline" size={16} color={COLORS.purple} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Referred Users */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Referred Users</Text>
          <Text style={styles.sectionSub}>{MOCK_REFERRALS.users.length} users referred</Text>

          {MOCK_REFERRALS.users.length === 0 ? (
            <EmptyState icon="people-outline" title="No Referrals Yet" subtitle="Share your link to start earning" />
          ) : (
            <View style={styles.userList}>
              {MOCK_REFERRALS.users.map((u) => (
                <View key={u.id} style={styles.userCard}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userInitial}>{u.name[0]}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userDate}>Joined {u.joinDate}</Text>
                  </View>
                  <View style={styles.userRight}>
                    <Text style={styles.userEarning}>+₦{u.earnings}</Text>
                    <View style={[styles.userBadge, { backgroundColor: u.status === 'active' ? `${COLORS.success}20` : `${COLORS.textMuted}20` }]}>
                      <Text style={[styles.userBadgeText, { color: u.status === 'active' ? COLORS.success : COLORS.textMuted }]}>
                        {u.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  statLabel: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  linkCard: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 20, gap: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Nunito_700Bold' },
  sectionSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular', marginTop: -8 },
  linkBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCardAlt, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  linkText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  linkActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bgCardAlt, padding: 12, borderRadius: 10 },
  codeLabel: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  codeBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeText: { color: COLORS.purpleLight, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  usersSection: { gap: 14 },
  userList: { gap: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${COLORS.purple}30`, alignItems: 'center', justifyContent: 'center' },
  userInitial: { color: COLORS.purpleLight, fontSize: 18, fontFamily: 'Nunito_700Bold' },
  userInfo: { flex: 1, gap: 3 },
  userName: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  userDate: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  userRight: { alignItems: 'flex-end', gap: 4 },
  userEarning: { color: COLORS.success, fontSize: 14, fontFamily: 'Nunito_700Bold' },
  userBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  userBadgeText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
});
