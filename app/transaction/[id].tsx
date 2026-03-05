import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { useTransactionStore } from '@/store/transactionStore';

function getServiceIcon(type: string, colors: any) {
  switch (type) {
    case 'airtime': return { icon: 'phone-portrait', color: colors.airtime };
    case 'data': return { icon: 'wifi', color: colors.data };
    case 'electricity': return { icon: 'flash', color: colors.electricity };
    case 'cable': return { icon: 'tv-outline', color: colors.cable };
    case 'bills': return { icon: 'receipt-outline', color: colors.bills };
    case 'internet': return { icon: 'globe-outline', color: colors.internet };
    case 'deposit': return { icon: 'card-outline', color: colors.success };
    default: return { icon: 'cash-outline', color: colors.purple };
  }
}

function InfoRow({ label, value, valueColor, copyable, borderColor, labelColor, textColor }: {
  label: string; value: string; valueColor?: string; copyable?: boolean;
  borderColor: string; labelColor: string; textColor: string;
}) {
  const copy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', value);
  };

  return (
    <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
      <Text style={[styles.infoLabel, { color: labelColor }]}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={[styles.infoValue, { color: valueColor || textColor }]} numberOfLines={1} ellipsizeMode="middle">
          {value}
        </Text>
        {copyable && (
          <Pressable onPress={copy}>
            <Ionicons name="copy-outline" size={16} color={labelColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransaction } = useTransactionStore();
  const insets = useSafeAreaInsets();
  const tx = getTransaction(id);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  if (!tx) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingTop: topPadding }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>Transaction not found</Text>
        </View>
      </View>
    );
  }

  const { icon, color } = getServiceIcon(tx.type, colors);
  const statusColor = tx.status === 'completed' ? colors.success : tx.status === 'failed' ? colors.error : colors.warning;
  const baseAmount = tx.amount - tx.fee;
  const feePercent = baseAmount > 0 ? ((tx.fee / baseAmount) * 100).toFixed(2) : '0';

  const infoProps = { borderColor: colors.border, labelColor: colors.textMuted, textColor: colors.textPrimary };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPadding }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon as any} size={28} color={color} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{tx.description}</Text>
          <Text style={[styles.heroDate, { color: colors.textMuted }]}>{tx.date}</Text>
          <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>₦{tx.amount.toLocaleString()}</Text>
          {tx.fee > 0 && (
            <Text style={[styles.heroFee, { color: colors.textMuted }]}>(₦{baseAmount.toLocaleString()} + ₦{tx.fee} fees)</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{tx.status}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Basic Information</Text>
          <InfoRow {...infoProps} label="Transaction ID" value={tx.id} copyable />
          <InfoRow {...infoProps} label="Type" value={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} />
          <InfoRow {...infoProps} label="Amount" value={`₦${tx.amount.toLocaleString()}`} />
          <InfoRow {...infoProps} label="Status" value={tx.status} valueColor={statusColor} />
          {tx.provider && <InfoRow {...infoProps} label="Provider" value={tx.provider} />}
          {tx.recipient && <InfoRow {...infoProps} label="Recipient" value={tx.recipient} />}
          <InfoRow {...infoProps} label="Reference" value={tx.reference} copyable />
          <View style={[styles.lastInfoRow]}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{tx.date}</Text>
          </View>
        </View>

        {tx.fee > 0 && (
          <View style={[styles.infoCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>Fee Breakdown</Text>
            <InfoRow {...infoProps} label="Original Price" value={`₦${baseAmount.toLocaleString()}`} />
            <InfoRow {...infoProps} label={`Service Charge (${feePercent}%)`} value={`+₦${tx.fee}`} valueColor={colors.error} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Charged</Text>
              <Text style={[styles.totalValue, { color: colors.error }]}>₦{tx.amount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold' },
  heroCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, marginBottom: 16 },
  heroIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { fontSize: 20, fontFamily: 'Nunito_700Bold' },
  heroDate: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 4 },
  heroAmount: { fontSize: 32, fontFamily: 'Nunito_800ExtraBold' },
  heroFee: { fontSize: 13, fontFamily: 'Nunito_400Regular' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  infoCard: { borderRadius: 18, padding: 20, borderWidth: 1, marginBottom: 14 },
  infoTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  lastInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { fontSize: 14, fontFamily: 'Nunito_400Regular' },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' },
  infoValue: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', textAlign: 'right', flexShrink: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4 },
  totalLabel: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  totalValue: { fontSize: 17, fontFamily: 'Nunito_800ExtraBold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, fontFamily: 'Nunito_400Regular' },
});
