import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { Transaction } from '@/lib/mockData';

interface TransactionCardProps {
  transaction: Transaction;
}

function getServiceIcon(type: Transaction['type'], provider?: string) {
  switch (type) {
    case 'airtime':
      return { icon: 'phone-portrait-outline', lib: 'ionicons', color: COLORS.airtime };
    case 'data':
      return { icon: 'wifi', lib: 'feather', color: COLORS.data };
    case 'electricity':
      return { icon: 'flash', lib: 'ionicons', color: COLORS.electricity };
    case 'cable':
      return { icon: 'tv-outline', lib: 'ionicons', color: COLORS.cable };
    case 'bills':
      return { icon: 'receipt-outline', lib: 'ionicons', color: COLORS.bills };
    case 'internet':
      return { icon: 'globe-outline', lib: 'ionicons', color: COLORS.internet };
    case 'deposit':
      return { icon: 'card-outline', lib: 'ionicons', color: COLORS.success };
    default:
      return { icon: 'cash-outline', lib: 'ionicons', color: COLORS.purple };
  }
}

function ServiceIcon({ type, provider }: { type: Transaction['type']; provider?: string }) {
  const { icon, lib, color } = getServiceIcon(type, provider);

  return (
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      {lib === 'feather' ? (
        <Feather name={icon as any} size={20} color={color} />
      ) : (
        <Ionicons name={icon as any} size={20} color={color} />
      )}
    </View>
  );
}

function getStatusColor(status: Transaction['status']) {
  switch (status) {
    case 'completed': return COLORS.success;
    case 'failed': return COLORS.error;
    case 'pending': return COLORS.warning;
  }
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const statusColor = getStatusColor(transaction.status);

  const handlePress = () => {
    router.push({ pathname: '/transaction/[id]', params: { id: transaction.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <ServiceIcon type={transaction.type} provider={transaction.provider} />
      <View style={styles.info}>
        <Text style={styles.title}>{transaction.description}</Text>
        <Text style={styles.date}>{transaction.date.split(' at')[0]}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>₦{transaction.amount.toLocaleString()}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{transaction.status}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amount: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
  },
  status: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
  },
});
