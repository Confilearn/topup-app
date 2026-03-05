import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';
import { useTransactionStore } from '@/store/transactionStore';

function getServiceIcon(type: string) {
  switch (type) {
    case 'airtime': return { icon: 'phone-portrait', color: COLORS.airtime };
    case 'data': return { icon: 'wifi', color: COLORS.data };
    case 'electricity': return { icon: 'flash', color: COLORS.electricity };
    case 'cable': return { icon: 'tv-outline', color: COLORS.cable };
    case 'bills': return { icon: 'receipt-outline', color: COLORS.bills };
    case 'internet': return { icon: 'globe-outline', color: COLORS.internet };
    case 'deposit': return { icon: 'card-outline', color: COLORS.success };
    default: return { icon: 'cash-outline', color: COLORS.purple };
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return COLORS.success;
    case 'failed': return COLORS.error;
    case 'pending': return COLORS.warning;
    default: return COLORS.textMuted;
  }
}

function InfoRow({ label, value, valueColor, copyable }: { label: string; value: string; valueColor?: string; copyable?: boolean }) {
  const copy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', value);
  };

  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <View style={infoStyles.valueRow}>
        <Text style={[infoStyles.value, valueColor ? { color: valueColor } : null]} numberOfLines={1} ellipsizeMode="middle">
          {value}
        </Text>
        {copyable && (
          <Pressable onPress={copy}>
            <Ionicons name="copy-outline" size={16} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' },
  value: { color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Nunito_600SemiBold', textAlign: 'right', flexShrink: 1 },
});

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransaction } = useTransactionStore();
  const insets = useSafeAreaInsets();
  const tx = getTransaction(id);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  if (!tx) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  const { icon, color } = getServiceIcon(tx.type);
  const statusColor = getStatusColor(tx.status);
  const baseAmount = tx.amount - tx.fee;
  const feePercent = baseAmount > 0 ? ((tx.fee / baseAmount) * 100).toFixed(2) : '0';

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <Text style={styles.heroTitle}>{tx.description}</Text>
          <Text style={styles.heroDate}>{tx.date}</Text>
          <Text style={styles.heroAmount}>₦{tx.amount.toLocaleString()}</Text>
          {tx.fee > 0 && (
            <Text style={styles.heroFee}>(₦{baseAmount.toLocaleString()} + ₦{tx.fee} fees)</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{tx.status}</Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Basic Information</Text>
          <InfoRow label="Transaction ID" value={tx.id} copyable />
          <InfoRow label="Type" value={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} />
          <InfoRow label="Amount" value={`₦${tx.amount.toLocaleString()}`} />
          <InfoRow label="Status" value={tx.status} valueColor={statusColor} />
          {tx.provider && <InfoRow label="Provider" value={tx.provider} />}
          {tx.recipient && <InfoRow label="Recipient" value={tx.recipient} />}
          <InfoRow label="Reference" value={tx.reference} copyable />
          <View style={[infoStyles.row, { borderBottomWidth: 0 }]}>
            <Text style={infoStyles.label}>Date</Text>
            <Text style={infoStyles.value}>{tx.date}</Text>
          </View>
        </View>

        {/* Fee Breakdown */}
        {tx.fee > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Fee Breakdown</Text>
            <InfoRow label="Original Price" value={`₦${baseAmount.toLocaleString()}`} />
            <InfoRow
              label={`Service Charge (${feePercent}%)`}
              value={`+₦${tx.fee}`}
              valueColor={COLORS.error}
            />
            <View style={[styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Charged</Text>
              <Text style={[styles.totalValue, { color: COLORS.error }]}>₦{tx.amount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontFamily: 'Nunito_700Bold' },
  heroCard: { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 20, fontFamily: 'Nunito_700Bold' },
  heroDate: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 4 },
  heroAmount: { color: COLORS.textPrimary, fontSize: 32, fontFamily: 'Nunito_800ExtraBold' },
  heroFee: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  infoCard: { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  infoTitle: { color: COLORS.textPrimary, fontSize: 17, fontFamily: 'Nunito_700Bold', marginBottom: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4 },
  totalLabel: { color: COLORS.textPrimary, fontSize: 15, fontFamily: 'Nunito_700Bold' },
  totalValue: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { color: COLORS.textMuted, fontSize: 16, fontFamily: 'Nunito_400Regular' },
});
