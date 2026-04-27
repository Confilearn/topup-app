import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useTheme';
import { useTransactionStore, Transaction } from '@/store/transactionStore';
import TransactionItem from './TransactionItem';
import EmptyTransactionState from './EmptyTransactionState';

interface TransactionListProps {
  transactions?: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
  showDate?: boolean;
  compact?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  emptyType?: 'all' | 'recent' | 'filtered';
  emptyMessage?: string;
  maxItems?: number;
}

/**
 * TransactionList component - Displays a list of transactions with proper loading and empty states
 * Follows clean coding practices with comprehensive commenting
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  transactions: externalTransactions,
  onTransactionPress,
  showDate = true,
  compact = false,
  loading: externalLoading,
  onRefresh,
  emptyType = 'all',
  emptyMessage,
  maxItems,
}) => {
  const colors = useColors();
  
  // Use store transactions if external transactions not provided
  const {
    transactions: storeTransactions,
    isLoading: storeLoading,
    error,
    refreshTransactions,
  } = useTransactionStore();

  // Determine which transactions to use
  const transactions = externalTransactions || storeTransactions;
  const isLoading = externalLoading !== undefined ? externalLoading : storeLoading;

  // Handle refresh
  const handleRefresh = React.useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshTransactions();
    }
  }, [onRefresh, refreshTransactions]);

  // Limit transactions if maxItems is specified
  const displayTransactions = maxItems 
    ? transactions.slice(0, maxItems)
    : transactions;

  // Show loading state
  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <View style={styles.loadingContainer}>
          <EmptyTransactionState 
            type="all" 
            message="Loading transactions..."
            icon="time-outline"
          />
        </View>
      </View>
    );
  }

  // Show error state
  if (error && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <View style={styles.loadingContainer}>
          <EmptyTransactionState 
            type="all" 
            message="Error loading transactions"
            icon="alert-circle-outline"
          />
        </View>
      </View>
    );
  }

  // Show empty state
  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
        <EmptyTransactionState 
          type={emptyType} 
          message={emptyMessage}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={colors.purple}
          colors={[colors.purple]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {displayTransactions.map((transaction) => (
        <TransactionItem
          key={transaction._id}
          transaction={transaction}
          onPress={onTransactionPress}
          showDate={showDate}
          compact={compact}
        />
      ))}
      
      {/* Add some padding at the bottom for better scrolling experience */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default TransactionList;
