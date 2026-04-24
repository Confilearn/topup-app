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
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { AppHeader } from '@/components/ui/AppHeader';
import { MOCK_REFERRALS, MOCK_USER } from '@/lib/mockData';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ReferralsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const STAT_CARDS = [
    { label: 'Total Referrals', value: String(MOCK_REFERRALS.totalReferrals), icon: 'people', color: colors.purple },
    { label: 'Total Earnings', value: `₦${MOCK_REFERRALS.totalEarnings.toLocaleString()}`, icon: 'wallet', color: colors.success },
    { label: 'Referral Bonus', value: `₦${MOCK_REFERRALS.referralBonus.toLocaleString()}`, icon: 'gift', color: colors.blue },
    { label: 'Pending Bonus', value: `₦${MOCK_REFERRALS.pendingBonus.toLocaleString()}`, icon: 'time', color: colors.warning },
  ];

  const copyLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', MOCK_USER.referralLink + ' copied to clipboard');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <AppHeader />
        <Text style={[styles.title, { color: colors.textPrimary }]}>Referrals</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Earn rewards by inviting friends</Text>

        <View style={styles.statsGrid}>
          {STAT_CARDS.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}20` }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.linkCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Referral Link</Text>
          <View style={[styles.linkBox, { backgroundColor: colors.bgCardAlt, borderColor: colors.border }]}>
            <Ionicons name="link-outline" size={18} color={colors.purple} />
            <Text style={[styles.linkText, { color: colors.textSecondary }]} numberOfLines={1}>
              {MOCK_USER.referralLink}
            </Text>
          </View>
          <View style={styles.linkActions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: `${colors.purple}20`, borderColor: colors.purple }]}
              onPress={copyLink}
            >
              <Ionicons name="copy-outline" size={16} color={colors.purpleLight} />
              <Text style={[styles.actionText, { color: colors.purpleLight }]}>Copy Link</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: `${colors.blue}20`, borderColor: colors.blue }]}
              onPress={() => Alert.alert('Share', 'Share sheet would open here')}
            >
              <Ionicons name="share-outline" size={16} color={colors.blueLight} />
              <Text style={[styles.actionText, { color: colors.blueLight }]}>Share</Text>
            </Pressable>
          </View>
          <View style={[styles.codeRow, { backgroundColor: colors.bgCardAlt }]}>
            <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={[styles.codeText, { color: colors.purpleLight }]}>{MOCK_USER.referralCode}</Text>
              <Pressable onPress={copyLink}>
                <Ionicons name="copy-outline" size={16} color={colors.purple} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.usersSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Referred Users</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>{MOCK_REFERRALS.users.length} users referred</Text>

          {MOCK_REFERRALS.users.length === 0 ? (
            <EmptyState icon="people-outline" title="No Referrals Yet" subtitle="Share your link to start earning" />
          ) : (
            <View style={styles.userList}>
              {MOCK_REFERRALS.users.map((u) => (
                <View key={u.id} style={[styles.userCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
                  <View style={[styles.userAvatar, { backgroundColor: `${colors.purple}30` }]}>
                    <Text style={[styles.userInitial, { color: colors.purpleLight }]}>{u.name[0]}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{u.name}</Text>
                    <Text style={[styles.userDate, { color: colors.textMuted }]}>Joined {u.joinDate}</Text>
                  </View>
                  <View style={styles.userRight}>
                    <Text style={[styles.userEarning, { color: colors.success }]}>+₦{u.earnings}</Text>
                    <View style={[styles.userBadge, { backgroundColor: u.status === 'active' ? `${colors.success}20` : `${colors.textMuted}20` }]}>
                      <Text style={[styles.userBadgeText, { color: u.status === 'active' ? colors.success : colors.textMuted }]}>
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
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  title: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  linkCard: { borderRadius: 18, padding: 20, gap: 14, borderWidth: 1, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  sectionSub: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  linkBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 12, borderWidth: 1 },
  linkText: { flex: 1, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  linkActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  actionText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10 },
  codeLabel: { fontSize: 13, fontFamily: 'Nunito_400Regular' },
  codeBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeText: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  usersSection: { gap: 14 },
  userList: { gap: 10 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userInitial: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  userInfo: { flex: 1, gap: 3 },
  userName: { fontSize: 15, fontFamily: 'Nunito_600SemiBold' },
  userDate: { fontSize: 12, fontFamily: 'Nunito_400Regular' },
  userRight: { alignItems: 'flex-end', gap: 4 },
  userEarning: { fontSize: 14, fontFamily: 'Nunito_700Bold' },
  userBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  userBadgeText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
});
