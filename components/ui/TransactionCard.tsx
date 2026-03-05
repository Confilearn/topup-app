import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useTheme';
import { Transaction } from '@/lib/mockData';

function getServiceIcon(type: Transaction['type']) {
  switch (type) {
    case 'airtime': return { icon: 'phone-portrait-outline', lib: 'ionicons', colorKey: 'airtime' };
    case 'data': return { icon: 'wifi', lib: 'feather', colorKey: 'data' };
    case 'electricity': return { icon: 'flash', lib: 'ionicons', colorKey: 'electricity' };
    case 'cable': return { icon: 'tv-outline', lib: 'ionicons', colorKey: 'cable' };
    case 'bills': return { icon: 'receipt-outline', lib: 'ionicons', colorKey: 'bills' };
    case 'internet': return { icon: 'globe-outline', lib: 'ionicons', colorKey: 'internet' };
    case 'deposit': return { icon: 'card-outline', lib: 'ionicons', colorKey: 'success' };
    default: return { icon: 'cash-outline', lib: 'ionicons', colorKey: 'purple' };
  }
}

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  const colors = useColors();
  const { icon, lib, colorKey } = getServiceIcon(transaction.type);
  const iconColor = (colors as any)[colorKey] || colors.purple;
  const statusColor = transaction.status === 'completed' ? colors.success
    : transaction.status === 'failed' ? colors.error : colors.warning;
  const isCredit = transaction.type === 'deposit';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/transaction/[id]', params: { id: transaction.id } });
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgCard, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        {lib === 'feather'
          ? <Feather name={icon as any} size={20} color={iconColor} />
          : <Ionicons name={icon as any} size={20} color={iconColor} />}
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {transaction.date.split(' at')[0]}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{transaction.status}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? colors.success : colors.textPrimary }]}>
          {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </Text>
        <Text style={[styles.refText, { color: colors.textMuted }]} numberOfLines={1}>
          {transaction.provider || ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 12, borderWidth: 1 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontFamily: 'Nunito_600SemiBold' },
  date: { fontSize: 11, fontFamily: 'Nunito_400Regular' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', textTransform: 'capitalize' },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 15, fontFamily: 'Nunito_700Bold' },
  refText: { fontSize: 11, fontFamily: 'Nunito_400Regular', maxWidth: 70 },
});
