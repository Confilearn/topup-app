import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useTheme";
import { AppHeader } from "@/components/ui/AppHeader";
import { useTransactionStore, Transaction } from "@/store/transactionStore";
import TransactionList from "@/components/transactions/TransactionList";
import EmptyTransactionState from "@/components/transactions/EmptyTransactionState";

// Status filter options
const STATUS_FILTERS = ["All", "Completed", "Failed", "Pending"];

/**
 * TransactionsScreen - Main screen for viewing transaction history
 * Features search, filtering, and pull-to-refresh functionality
 * Follows clean coding practices with comprehensive commenting
 */
export default function TransactionsScreen() {
  const colors = useColors();

  // Transaction store hooks
  const {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    refreshTransactions,
    getTransactionsByType,
    getTransactionsByStatus,
  } = useTransactionStore();

  // Local state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions().catch((error) => {
      console.error("Failed to fetch transactions:", error);
    });
  }, [fetchTransactions]);

  // Filter transactions based on search and status
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((transaction) => {
        // Search in transaction type, reference, and details
        const typeMatch = transaction.type.toLowerCase().includes(searchLower);
        const referenceMatch = transaction.reference
          .toLowerCase()
          .includes(searchLower);
        const detailsMatch = transaction.details
          ? Object.values(transaction.details).some(
              (value) =>
                value && value.toString().toLowerCase().includes(searchLower),
            )
          : false;

        return typeMatch || referenceMatch || detailsMatch;
      });
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter.toLowerCase(),
      );
    }

    return filtered;
  }, [transactions, search, statusFilter]);

  // Handle refresh
  const handleRefresh = () => {
    refreshTransactions().catch((error) => {
      console.error("Failed to refresh transactions:", error);
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bgPrimary }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppHeader />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Transaction History
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            View all your transaction activities
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.bgCard, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        {/* Status Filters */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: colors.bgCard,
                  borderColor: colors.border,
                },
                statusFilter === filter && {
                  backgroundColor: `${colors.purple}15`,
                  borderColor: colors.purple,
                },
              ]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      statusFilter === filter
                        ? colors.purple
                        : colors.textMuted,
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Transaction Count */}
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
          {search && " found"}
        </Text>

        {/* Transaction List */}
        <View style={styles.listContainer}>
          <TransactionList
            transactions={filteredTransactions}
            onRefresh={handleRefresh}
            loading={isLoading}
            emptyType={search ? "filtered" : "all"}
            emptyMessage={
              search ? "No transactions found matching your search" : undefined
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: { paddingBottom: 20 },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },
  count: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
});
