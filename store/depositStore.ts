import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "@/lib/api";

// Deposit interface - matches server response structure
interface Deposit {
  id: string;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed";
  description: string;
  createdAt: string;
  reference?: string;
  fees?: number;
}

// Deposit store interface
interface DepositStore {
  // State
  deposits: Deposit[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchDepositHistory: () => Promise<void>;
  clearDepositHistory: () => void;
  isDataStale: (maxAgeMinutes?: number) => boolean;
  getDeposits: () => Deposit[];
  getTotalDeposits: () => number;
  getPendingDeposits: () => Deposit[];
}

// AsyncStorage storage for Zustand (mobile-only)
const mobileStorage = {
  getItem: async (name: string) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error("AsyncStorage getItem error:", error);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error("AsyncStorage setItem error:", error);
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error("AsyncStorage removeItem error:", error);
    }
  },
};

// Create deposit store with persistence
export const useDepositStore = create<DepositStore>()(
  persist(
    (set, get) => ({
      // Initial state
      deposits: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      // Fetch deposit history from server
      fetchDepositHistory: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await userAPI.getDepositHistory();

          // Handle different response structures
          let depositData = [];
          if (Array.isArray(response)) {
            // Server returns array directly
            depositData = response;
          } else if (response && response.data) {
            if (Array.isArray(response.data)) {
              depositData = response.data;
            } else if (
              response.data.deposits &&
              Array.isArray(response.data.deposits)
            ) {
              depositData = response.data.deposits;
            }
          }

          // Store deposits locally
          const deposits: Deposit[] = depositData.map((dep: any) => ({
            id: dep._id || dep.id,
            amount: dep.amount || 0,
            method: dep.paymentMethod || "Bank Transfer",
            status: dep.status || "pending",
            description:
              dep.description ||
              `Deposit of ₦${(dep.amount || 0).toLocaleString()}`,
            createdAt: dep.createdAt || new Date().toISOString(),
            reference: dep.reference || dep.transactionReference,
            fees: dep.feeAmount || dep.fees,
          }));

          set({
            deposits,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (error) {
          console.error("Failed to fetch deposit history:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch deposit history",
          });
        }
      },

      // Clear deposit history
      clearDepositHistory: () => {
        set({
          deposits: [],
          error: null,
          lastFetched: null,
        });
      },

      // Check if stored data is stale (older than specified minutes)
      isDataStale: (maxAgeMinutes = 15) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;

        const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
        return Date.now() - lastFetched > maxAge;
      },

      // Get all deposits
      getDeposits: () => {
        const { deposits } = get();
        return deposits.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },

      // Get total deposited amount
      getTotalDeposits: () => {
        const { deposits } = get();
        return deposits
          .filter((dep) => dep.status === "completed")
          .reduce((total, dep) => total + dep.amount, 0);
      },

      // Get pending deposits
      getPendingDeposits: () => {
        const { deposits } = get();
        return deposits.filter((dep) => dep.status === "pending");
      },
    }),
    {
      name: "deposit-storage",
      storage: createJSONStorage(() => mobileStorage),
      // Only persist essential data
      partialize: (state) => ({
        deposits: state.deposits,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
