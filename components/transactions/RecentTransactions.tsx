import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '@/hooks/useTheme';
import { useTransactionStore } from '@/store/transactionStore';
import TransactionItem from './TransactionItem';
import EmptyTransactionState from './EmptyTransactionState';

interface RecentTransactionsProps {
  maxItems?: number;
  compact?: boolean;
  onViewAll?: () => void;
}

/**
 * RecentTransactions component - Displays recent transactions for dashboard
 * Follows clean coding practices with comprehensive commenting
 */
export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  maxItems = 3,
  compact = true,
  onViewAll,
}) => {
  const colors = useColors();
  
  // Transaction store hooks
  const {
    recentTransactions,
    isLoading,
    fetchRecentTransactions,
  } = useTransactionStore();

  // Handle transaction press
  const handleTransactionPress = (transaction: any) => {
    // For now, just log the transaction
    // In a real app, this would navigate to transaction details
    console.log('Transaction pressed:', transaction);
  };

  // Handle view all press
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  // Get display transactions (limit to maxItems)
  const displayTransactions = recentTransactions.slice(0, maxItems);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Recent Transactions
        </Text>
        {onViewAll && displayTransactions.length > 0 && (
          <Pressable onPress={handleViewAll}>
            <Text style={[styles.viewAllText, { color: colors.purple }]}>
              View All
            </Text>
          </Pressable>
        )}
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        {isLoading && recentTransactions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading recent transactions...
            </Text>
          </View>
        ) : displayTransactions.length === 0 ? (
          <EmptyTransactionState 
            type="recent" 
            icon="time-outline"
          />
        ) : (
          displayTransactions.map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onPress={handleTransactionPress}
              showDate={false}
              compact={compact}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  transactionsContainer: {
    gap: 0,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
  },
});

export default RecentTransactions;
