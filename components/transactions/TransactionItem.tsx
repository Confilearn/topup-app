import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useTheme';
import { Transaction } from '@/store/transactionStore';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  showDate?: boolean;
  compact?: boolean;
}

/**
 * TransactionItem component - Displays a single transaction with proper styling
 * Follows clean coding practices with comprehensive commenting
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showDate = true,
  compact = false,
}) => {
  const colors = useColors();

  // Get transaction type icon and color
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return { icon: 'card-outline' as const, color: colors.success };
      case 'airtime':
        return { icon: 'phone-portrait-outline' as const, color: colors.blue };
      case 'data':
        return { icon: 'wifi-outline' as const, color: colors.purple };
      case 'electricity':
        return { icon: 'flash-outline' as const, color: colors.warning };
      case 'cable':
        return { icon: 'tv-outline' as const, color: colors.error };
      default:
        return { icon: 'receipt-outline' as const, color: colors.textSecondary };
    }
  };

  // Get status color and text
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: colors.success, text: 'Completed' };
      case 'failed':
        return { color: colors.error, text: 'Failed' };
      case 'pending':
        return { color: colors.warning, text: 'Pending' };
      default:
        return { color: colors.textMuted, text: status };
    }
  };

  // Format transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    const { type, details } = transaction;
    
    switch (type) {
      case 'deposit':
        return 'Wallet Deposit';
      case 'airtime':
        return details?.network ? `${details.network} Airtime` : 'Airtime Recharge';
      case 'data':
        return details?.network ? `${details.network} Data` : 'Data Purchase';
      case 'electricity':
        return details?.provider ? `${details.provider} Electricity` : 'Electricity Bill';
      case 'cable':
        return details?.provider ? `${details.provider} TV` : 'Cable Subscription';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const { icon, color } = getTransactionIcon(transaction.type);
  const { color: statusColor, text: statusText } = getStatusStyle(transaction.status);
  const description = getTransactionDescription(transaction);

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      style={[
        styles.container,
        { backgroundColor: colors.bgCard, borderColor: colors.border },
        compact && styles.compactContainer,
      ]}
    >
      {/* Transaction Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={compact ? 20 : 24} color={color} />
      </View>

      {/* Transaction Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.description,
              { color: colors.textPrimary },
              compact && styles.compactDescription,
            ]}
            numberOfLines={1}
          >
            {description}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: colors.textPrimary },
              compact && styles.compactAmount,
            ]}
          >
            {formatAmount(transaction.amount)}
          </Text>
        </View>

        {/* Transaction details and status */}
        <View style={styles.footerRow}>
          <View style={styles.detailsInfo}>
            {/* Show recipient or reference */}
            {transaction.details?.mobileNumber && (
              <Text
                style={[styles.detailsText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {transaction.details.mobileNumber}
              </Text>
            )}
            {transaction.details?.meterNum && (
              <Text
                style={[styles.detailsText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                Meter: {transaction.details.meterNum}
              </Text>
            )}
            {transaction.reference && (
              <Text
                style={[styles.detailsText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                Ref: {transaction.reference}
              </Text>
            )}
          </View>

          {/* Status and Date */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <Text
                style={[styles.statusText, { color: statusColor }]}
                numberOfLines={1}
              >
                {statusText}
              </Text>
            </View>
            {showDate && (
              <Text
                style={[styles.dateText, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {formatDate(transaction.createdAt)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
  },
  compactContainer: {
    padding: 12,
    marginBottom: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    flex: 1,
    marginRight: 8,
  },
  compactDescription: {
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
  },
  compactAmount: {
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsInfo: {
    flex: 1,
    marginRight: 8,
  },
  detailsText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    marginBottom: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
  },
});

export default TransactionItem;
