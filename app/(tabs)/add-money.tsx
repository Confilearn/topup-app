import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '@/constants/colors';
import { useWalletStore } from '@/store/walletStore';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_DEPOSITS } from '@/lib/mockData';

export default function AddMoneyScreen() {
  const insets = useSafeAreaInsets();
  const { virtualAccount, hasVirtualAccount, createVirtualAccount } = useWalletStore();
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const handleCreateAccount = async () => {
    if (!bvn || bvn.length < 11) return;
    setLoading(true);
    await createVirtualAccount(bvn);
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const copyToClipboard = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      Alert.alert('Copied!', text + ' copied to clipboard');
    } else {
      Alert.alert('Copied!', text + ' copied to clipboard');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable>
            <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.brandName}>TopupAfrica</Text>
          <Pressable>
            <Ionicons name="sunny" size={22} color={COLORS.warning} />
          </Pressable>
        </View>

        <Text style={styles.title}>Add Money</Text>
        <Text style={styles.subtitle}>Fund your wallet to start making purchases</Text>

        {/* Charge Notice */}
        <View style={styles.notice}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Deposit Charges Apply</Text>
            <Text style={styles.noticeText}>
              A 10% service charge applies to all deposits to cover processing fees.
            </Text>
          </View>
        </View>

        {hasVirtualAccount && virtualAccount ? (
          <>
            {/* Virtual Account Card */}
            <LinearGradient
              colors={['#7C3AED', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vaCard}
            >
              <View style={styles.vaHeader}>
                <View>
                  <Text style={styles.vaSmall}>Virtual Account</Text>
                  <Text style={styles.vaBank}>{virtualAccount.provider}</Text>
                </View>
                <Ionicons name="card" size={28} color="rgba(255,255,255,0.8)" />
              </View>

              <View style={styles.vaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vaSmall}>Account Number</Text>
                  <Text style={styles.vaNumber}>{virtualAccount.accountNumber}</Text>
                </View>
                <Pressable onPress={() => copyToClipboard(virtualAccount.accountNumber)} style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={20} color="rgba(255,255,255,0.8)" />
                </Pressable>
              </View>

              <View>
                <Text style={styles.vaSmall}>Bank Name</Text>
                <Text style={styles.vaValue}>{virtualAccount.bankName}</Text>
              </View>

              <View>
                <Text style={styles.vaSmall}>Account Name</Text>
                <Text style={styles.vaValue}>{virtualAccount.accountName}</Text>
              </View>
            </LinearGradient>

            {/* How to Fund */}
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>How to Fund Your Wallet</Text>
              <View style={styles.howItem}>
                <Text style={styles.howItemTitle}>Bank Transfer</Text>
                <Text style={styles.howItemText}>
                  Transfer money to the account details above from any bank app or USSD.
                </Text>
              </View>
              <View style={styles.howItem}>
                <Text style={styles.howItemTitle}>Instant Credit</Text>
                <Text style={styles.howItemText}>
                  Your wallet will be credited automatically within 5 minutes.
                </Text>
              </View>
              <View style={styles.minNote}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.blue} />
                <Text style={styles.minNoteText}>
                  Minimum funding amount is ₦100. Maximum is ₦500,000 per transaction.
                </Text>
              </View>
            </View>

            {/* Deposit History */}
            <View style={styles.section}>
              <View style={styles.depositHeader}>
                <Ionicons name="time" size={20} color={COLORS.purple} />
                <View>
                  <Text style={styles.sectionTitle}>Deposit History</Text>
                  <Text style={styles.sectionSub}>Track your wallet funding history</Text>
                </View>
              </View>

              {MOCK_DEPOSITS.length === 0 ? (
                <EmptyState icon="wallet-outline" title="No Deposits Yet" subtitle="Your deposit history will appear here" />
              ) : (
                <View>
                  <View style={styles.depositTableHeader}>
                    <Text style={[styles.depositCol, { flex: 1.5 }]}>Amount</Text>
                    <Text style={[styles.depositCol, { flex: 1.5 }]}>Method</Text>
                    <Text style={[styles.depositCol, { flex: 1, textAlign: 'right' }]}>Status</Text>
                  </View>
                  {MOCK_DEPOSITS.map((dep) => (
                    <View key={dep.id} style={styles.depositRow}>
                      <Text style={[styles.depositAmount, { flex: 1.5 }]}>₦{dep.amount.toLocaleString()}</Text>
                      <Text style={[styles.depositMethod, { flex: 1.5 }]}>{dep.description}</Text>
                      <Text style={[
                        styles.depositStatus,
                        { flex: 1, textAlign: 'right', color: dep.status === 'completed' ? COLORS.success : dep.status === 'failed' ? COLORS.error : COLORS.warning }
                      ]}>
                        {dep.status}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          /* BVN Setup */
          <View style={styles.bvnCard}>
            <View style={styles.bvnIcon}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.purple} />
            </View>
            <Text style={styles.bvnTitle}>Create Virtual Account</Text>
            <Text style={styles.bvnSubtitle}>
              Enter your BVN to create a dedicated virtual account for funding your wallet.
            </Text>
            <Input
              label="Bank Verification Number (BVN)"
              placeholder="Enter your 11-digit BVN"
              value={bvn}
              onChangeText={setBvn}
              keyboardType="number-pad"
              maxLength={11}
            />
            <GradientButton
              title="Create Virtual Account"
              onPress={handleCreateAccount}
              loading={loading}
              disabled={loading || bvn.length < 11}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandName: { color: COLORS.purple, fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: COLORS.textPrimary, fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 6 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 20 },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: `${COLORS.warning}15`, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.warning}35`, marginBottom: 20, alignItems: 'flex-start' },
  noticeTitle: { color: COLORS.warning, fontSize: 14, fontFamily: 'Nunito_700Bold', marginBottom: 2 },
  noticeText: { color: `${COLORS.warning}CC`, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  vaCard: { borderRadius: 20, padding: 24, gap: 18, marginBottom: 20 },
  vaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vaSmall: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Nunito_400Regular', marginBottom: 4 },
  vaBank: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  vaRow: { flexDirection: 'row', alignItems: 'center' },
  vaNumber: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_700Bold', letterSpacing: 1 },
  copyBtn: { padding: 8 },
  vaValue: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_600SemiBold' },
  howCard: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 20, gap: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  howTitle: { color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Nunito_700Bold' },
  howItem: { backgroundColor: COLORS.bgCardAlt, borderRadius: 12, padding: 14, gap: 4 },
  howItemTitle: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  howItemText: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', lineHeight: 20 },
  minNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  minNoteText: { color: COLORS.blue, fontSize: 13, fontFamily: 'Nunito_500Medium', flex: 1, lineHeight: 20 },
  section: { marginBottom: 24 },
  depositHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontFamily: 'Nunito_700Bold' },
  sectionSub: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_400Regular' },
  depositTableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 4 },
  depositCol: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  depositRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  depositAmount: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  depositMethod: { color: COLORS.textSecondary, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  depositStatus: { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  bvnCard: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, gap: 16, borderWidth: 1, borderColor: COLORS.border },
  bvnIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${COLORS.purple}20`, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  bvnTitle: { color: COLORS.textPrimary, fontSize: 22, fontFamily: 'Nunito_800ExtraBold', textAlign: 'center' },
  bvnSubtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', textAlign: 'center', lineHeight: 22 },
});
