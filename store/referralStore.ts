import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "@/lib/api";

// Referral interface - matches server response structure
interface ReferralUser {
  _id: string;
  referrerId: {
    _id: string;
    username: string;
    email: string;
  };
  refereeId: {
    _id: string;
    username: string;
    email: string;
  };
  type: "referrer" | "referee";
  status: "pending" | "active" | "completed";
  earnings?: number;
  createdAt: string;
  updatedAt: string;
  referredUser: {
    id: string;
    username: string;
    email: string;
    joinDate: string;
    status: string;
    earnings: number;
  };
}

// Simple referral store interface
interface ReferralStore {
  // State
  referralHistory: ReferralUser[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentUserId: string | null; // Track current user for cache invalidation

  // Actions
  fetchReferralHistory: () => Promise<void>;
  clearReferralHistory: () => void;
  isDataStale: (maxAgeMinutes?: number) => boolean;
  getReferredUsers: () => ReferralUser[];
  setCurrentUser: (userId: string | null) => void; // Set current user for tracking
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

// Simple referral store with persistence
export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      // Initial state
      referralHistory: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      currentUserId: null,

      // Fetch referral history from server
      fetchReferralHistory: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await userAPI.getReferralHistory();

          // Filter to only show users that were referred by current user (referrer type)
          const referredUsers = response.filter(
            (referral: ReferralUser) => referral.type === "referrer",
          );

          set({
            referralHistory: referredUsers,
            isLoading: false,
            lastFetched: Date.now(),
            error: null,
          });
        } catch (error) {
          console.error("Failed to fetch referral history:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch referral history",
          });
        }
      },

      // Clear referral history
      clearReferralHistory: () => {
        set({
          referralHistory: [],
          currentUserId: null,
          error: null,
          lastFetched: null,
        });
      },

      // Check if data is stale (older than specified minutes)
      isDataStale: (maxAgeMinutes = 5) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;

        const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
        return Date.now() - lastFetched > maxAge;
      },

      // Get formatted referred users for UI
      getReferredUsers: () => {
        const { referralHistory } = get();

        return referralHistory.map((referral) => ({
          ...referral,
          // Format user data for easier UI consumption
          referredUser: {
            id: referral.refereeId._id,
            username: referral.refereeId.username,
            email: referral.refereeId.email,
            joinDate: new Date(referral.createdAt).toLocaleDateString(),
            status: referral.status,
            earnings: referral.earnings || 0,
          },
        }));
      },

      // Set current user for tracking
      setCurrentUser: (userId: string | null) => {
        const { currentUserId } = get();

        // Clear data if switching users
        if (currentUserId && currentUserId !== userId) {
          set({
            referralHistory: [],
            lastFetched: null,
            error: null,
          });
        }

        set({ currentUserId: userId });
      },
    }),
    {
      name: "referral-storage",
      storage: createJSONStorage(() => mobileStorage),
      // Only persist essential data
      partialize: (state) => ({
        referralHistory: state.referralHistory,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
