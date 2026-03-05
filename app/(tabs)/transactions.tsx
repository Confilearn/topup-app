import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { COLORS } from '@/constants/colors';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Transaction } from '@/lib/mockData';

const STATUS_FILTERS = ['All', 'Completed', 'Failed', 'Pending'];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions } = useTransactionStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPadding = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const filtered = useMemo(() => {
    let list = transactions;
    if (search) {
      list = list.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.provider?.toLowerCase().includes(search.toLowerCase()) ||
        t.reference.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.status === statusFilter.toLowerCase());
    }
    return list;
  }, [transactions, search, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />}
        ListHeaderComponent={() => (
          <View style={[styles.header, { paddingTop: topPadding }]}>
            <View style={styles.topBar}>
              <Pressable>
                <Ionicons name="menu" size={26} color={COLORS.textPrimary} />
              </Pressable>
              <Text style={styles.brandName}>TopupAfrica</Text>
              <Pressable>
                <Ionicons name="sunny" size={22} color={COLORS.warning} />
              </Pressable>
            </View>

            <Text style={styles.title}>Transaction History</Text>
            <Text style={styles.subtitle}>View all your transaction activities</Text>

            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search transactions..."
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
              {STATUS_FILTERS.map((f) => (
                <Pressable
                  key={f}
                  style={[styles.filterBtn, statusFilter === f && styles.filterBtnActive]}
                  onPress={() => setStatusFilter(f)}
                >
                  <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.count}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions Found"
            subtitle={search ? 'Try a different search term' : 'Your transactions will appear here'}
          />
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TransactionCard transaction={item} />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { paddingBottom: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandName: { color: COLORS.purple, fontSize: 20, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: COLORS.textPrimary, fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: `${COLORS.purple}30`, borderColor: COLORS.purple },
  filterText: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  filterTextActive: { color: COLORS.purpleLight },
  count: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 8 },
  item: { marginBottom: 10 },
});
