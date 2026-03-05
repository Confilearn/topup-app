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
import { useColors } from '@/hooks/useTheme';
import { AppHeader } from '@/components/ui/AppHeader';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionCard } from '@/components/ui/TransactionCard';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_FILTERS = ['All', 'Completed', 'Failed', 'Pending'];

export default function TransactionsScreen() {
  const colors = useColors();
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
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, paddingBottom: bottomPadding }]}>
      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} />}
        ListHeaderComponent={() => (
          <View style={[styles.header, { paddingTop: topPadding }]}>
            <AppHeader />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Transaction History</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>View all your transaction activities</Text>

            <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search transactions..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.filterRow}>
              {STATUS_FILTERS.map((f) => (
                <Pressable
                  key={f}
                  style={[
                    styles.filterBtn,
                    { backgroundColor: colors.bgCard, borderColor: colors.border },
                    statusFilter === f && { backgroundColor: `${colors.purple}25`, borderColor: colors.purple },
                  ]}
                  onPress={() => setStatusFilter(f)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: statusFilter === f ? colors.purpleLight : colors.textMuted },
                  ]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.count, { color: colors.textMuted }]}>
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </Text>
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
  container: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  header: { paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  count: { fontSize: 13, fontFamily: 'Nunito_400Regular', marginBottom: 8 },
  item: { marginBottom: 10 },
});
