import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { transactionAPI } from "@/lib/api";
import { useAuthStore } from "./authStore";

// Transaction interface matching server response
export interface Transaction {
  _id: string;
  userId: string;
  type: "deposit" | "airtime" | "data" | "electricity" | "cable";
  amount: number;
  originalAmount?: number;
  feeAmount?: number;
  feePercentage?: number;
  netAmount?: number;
  profitAmount?: number;
  markupPercentage?: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  details?: {
    // Airtime / Data
    mobileNumber?: string;
    network?: string;
    dataPlan?: string;
    // Electricity
    meterNum?: string;
    disco?: string;
    // Cable
    cableNum?: string;
    provider?: string;
    plan?: string;
    // Bank
    bank?: string;
    method?: string;
  };
  fullName: string;
  createdAt: string;
  updatedAt?: string;
}

// Transaction store interface
interface TransactionStore {
  // State
  transactions: Transaction[];
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentUserId: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  fetchRecentTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  getTransaction: (id: string) => Transaction | undefined;
  getTransactionsByType: (type: string) => Transaction[];
  getTransactionsByStatus: (status: string) => Transaction[];
  clearTransactions: () => void;
  refreshTransactions: () => Promise<void>;
  isDataStale: (maxAgeMinutes?: number) => boolean;
}

// AsyncStorage storage for Zustand (mobile-only)
const mobileStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      // Silent fail for storage
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Silent fail for storage
    }
  },
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      recentTransactions: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      currentUserId: null,

      // Fetch all transactions for the current user
      fetchTransactions: async () => {
        const { currentUserId, lastFetched } = get();
        const authStore = useAuthStore.getState();
        const currentAuthUserId = authStore.user?.id;

        // Force refresh if user has changed
        if (
          currentUserId &&
          currentAuthUserId &&
          currentUserId !== currentAuthUserId
        ) {
          console.log("User changed, invalidating transaction cache");
          set({ lastFetched: null }); // Force refresh
        }

        // Check if we have fresh data (less than 5 minutes old)
        const maxAge = 5 * 60 * 1000; // 5 minutes
        if (
          lastFetched &&
          Date.now() - lastFetched < maxAge &&
          get().transactions.length > 0 &&
          currentUserId === currentAuthUserId // Only use cache if same user
        ) {
          console.log("Using fresh transaction data from cache");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await transactionAPI.getTransactions();

          // Sort transactions by date (newest first)
          const sortedTransactions = response.sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          set({
            transactions: sortedTransactions,
            recentTransactions: sortedTransactions.slice(0, 5), // Get 5 most recent
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            currentUserId: currentAuthUserId, // Track current user
          });
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch transactions",
          });
        }
      },

      // Fetch only recent transactions (for dashboard widgets)
      fetchRecentTransactions: async () => {
        const { lastFetched, currentUserId } = get();
        const authStore = useAuthStore.getState();
        const currentAuthUserId = authStore.user?.id;

        // Force refresh if user has changed
        if (
          currentUserId &&
          currentAuthUserId &&
          currentUserId !== currentAuthUserId
        ) {
          console.log("User changed, invalidating recent transactions cache");
          set({ lastFetched: null }); // Force refresh
        }

        // Check if we have fresh data
        const maxAge = 2 * 60 * 1000; // 2 minutes for recent transactions
        if (
          lastFetched &&
          Date.now() - lastFetched < maxAge &&
          get().recentTransactions.length > 0 &&
          currentUserId === currentAuthUserId // Only use cache if same user
        ) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await transactionAPI.getTransactions();

          // Sort and get only 5 most recent
          const sortedTransactions = response
            .sort(
              (a: Transaction, b: Transaction) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5);

          set({
            recentTransactions: sortedTransactions,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            currentUserId: currentAuthUserId, // Track current user
          });
        } catch (error) {
          console.error("Failed to fetch recent transactions:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch recent transactions",
          });
        }
      },

      // Add a new transaction (for real-time updates)
      addTransaction: (transaction: Transaction) => {
        set((state) => {
          const updatedTransactions = [transaction, ...state.transactions];
          return {
            transactions: updatedTransactions,
            recentTransactions: updatedTransactions.slice(0, 5),
          };
        });
      },

      // Get a specific transaction by ID
      getTransaction: (id: string) => {
        return get().transactions.find((tx) => tx._id === id);
      },

      // Get transactions filtered by type
      getTransactionsByType: (type: string) => {
        return get().transactions.filter((tx) => tx.type === type);
      },

      // Get transactions filtered by status
      getTransactionsByStatus: (status: string) => {
        return get().transactions.filter((tx) => tx.status === status);
      },

      // Clear all transactions (for logout)
      clearTransactions: () => {
        set({
          transactions: [],
          recentTransactions: [],
          lastFetched: null,
          currentUserId: null,
          error: null,
        });
      },

      // Force refresh transactions
      refreshTransactions: async () => {
        set({ lastFetched: null }); // Reset cache
        await get().fetchTransactions();
      },

      // Check if data is stale
      isDataStale: (maxAgeMinutes: number = 5) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;

        const maxAge = maxAgeMinutes * 60 * 1000;
        return Date.now() - lastFetched > maxAge;
      },
    }),
    {
      name: "transaction-storage", // Storage key
      storage: createJSONStorage(() => mobileStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        transactions: state.transactions,
        recentTransactions: state.recentTransactions,
        lastFetched: state.lastFetched,
        currentUserId: state.currentUserId,
      }),
    },
  ),
);
