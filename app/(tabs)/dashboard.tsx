import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { AirtimeModal } from '@/components/services/AirtimeModal';
import { DataModal } from '@/components/services/DataModal';
import { ElectricityModal } from '@/components/services/ElectricityModal';
import { CableModal } from '@/components/services/CableModal';

type ServiceType = 'airtime' | 'data' | 'electricity' | 'cable' | 'bills' | 'internet' | null;

const SERVICES = [
  { id: 'airtime', icon: 'phone-portrait', colorKey: 'airtime', label: 'Airtime' },
  { id: 'data', icon: 'wifi', colorKey: 'data', label: 'Data' },
  { id: 'electricity', icon: 'flash', colorKey: 'electricity', label: 'Electricity' },
  { id: 'cable', icon: 'tv', colorKey: 'cable', label: 'Cable TV' },
  { id: 'bills', icon: 'receipt', colorKey: 'bills', label: 'Bills' },
  { id: 'internet', icon: 'globe', colorKey: 'internet', label: 'Internet' },
];

export default function DashboardScreen() {
  const colors = useColors();
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const { recentTransactions } = useTransactionStore();
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<ServiceType>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} />}
      >
        <AppHeader />

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetTitle, { color: colors.textPrimary }]}>
            Welcome back, {user?.firstName}!
          </Text>
          <Text style={[styles.greetSub, { color: colors.textMuted }]}>Ready to top up today?</Text>
        </View>

        {/* Wallet Card */}
        <LinearGradient
          colors={['#2D1B69', '#1E3A8A', '#1A1A50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? `₦${balance.toFixed(2)}` : '₦••••••'}
            </Text>
            <Pressable onPress={() => setBalanceVisible(!balanceVisible)} style={styles.eyeBtn}>
              <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
          <Pressable
            style={styles.fundBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/(tabs)/add-money'); }}
          >
            <Text style={styles.fundBtnText}>Fund Wallet</Text>
          </Pressable>
        </LinearGradient>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Services</Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((s) => {
              const svcColor = (colors as any)[s.colorKey];
              return (
                <Pressable
                  key={s.id}
                  style={({ pressed }) => [
                    styles.serviceItem,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                      opacity: pressed ? 0.8 : 1,
                      transform: pressed ? [{ scale: 0.95 }] : [],
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveModal(s.id as ServiceType);
                  }}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: `${svcColor}20` }]}>
                    <Ionicons name={s.icon as any} size={24} color={svcColor} />
                  </View>
                  <Text style={[styles.serviceLabel, { color: colors.textPrimary }]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/transactions')} style={styles.viewAllBtn}>
              <Text style={[styles.viewAllText, { color: colors.purple }]}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.purple} />
            </Pressable>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No Transactions"
              subtitle="Your recent transactions will appear here"
            />
          ) : (
            <View style={styles.txList}>
              {recentTransactions.slice(0, 3).map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AirtimeModal visible={activeModal === 'airtime'} onClose={() => setActiveModal(null)} />
      <DataModal visible={activeModal === 'data'} onClose={() => setActiveModal(null)} />
      <ElectricityModal visible={activeModal === 'electricity'} onClose={() => setActiveModal(null)} />
      <CableModal visible={activeModal === 'cable'} onClose={() => setActiveModal(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 110 },
  greeting: { marginBottom: 20 },
  greetTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  greetSub: { fontSize: 14, fontFamily: 'Nunito_400Regular' },
  walletCard: { borderRadius: 20, padding: 24, marginBottom: 28 },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  balanceAmount: { color: '#fff', fontSize: 36, fontFamily: 'Nunito_800ExtraBold' },
  eyeBtn: { padding: 4 },
  fundBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  fundBtnText: { color: '#C4B5FD', fontSize: 15, fontFamily: 'Nunito_700Bold' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceItem: {
    width: '30%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    flexGrow: 0,
  },
  serviceIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  txList: { gap: 10 },
});
