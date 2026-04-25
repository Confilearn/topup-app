import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userAPI } from "@/lib/api";

// User interface - matches server response structure (non-sensitive data only)
interface UserProfile {
  id: string;
  username: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  balance?: number;
  referralCode?: string;
  referrals?: {
    totalEarnings: number;
    totalReferrals: number;
    activeReferrals: number;
    pendingEarnings: number;
  };
  isVerified?: boolean;
  hasPurchased?: boolean;
  totalTransactions?: number;
  joinDate?: string;
  accountStatus?: string;
}

// User store interface
interface UserStore {
  // State
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch

  // Actions
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  refreshUserProfile: (userId: string) => Promise<void>;
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
      // Silent fail for storage errors
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Silent fail for storage errors
    }
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userProfile: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Fetch user profile from server
      fetchUserProfile: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          // Fetch user profile from /user/profile/:id endpoint
          const response = await userAPI.getProfile(userId);

          // Store non-sensitive user data locally
          const userData: UserProfile = {
            id: response.id,
            username: response.username,
            role: response.role,
            status: response.status,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            phone: response.phone,
            balance: response.balance,
            referralCode: response.referralCode,
            referrals: response.referrals,
            isVerified: response.isVerified,
            hasPurchased: response.hasPurchased,
            totalTransactions: response.totalTransactions,
            joinDate: response.createdAt, // Map createdAt to joinDate
            accountStatus: response.status, // Map status to accountStatus
          };

          set({
            userProfile: userData,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user profile";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Update user profile locally (for optimistic updates)
      updateUserProfile: (data: Partial<UserProfile>) => {
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, ...data }
            : null,
        }));
      },

      // Clear user profile (logout)
      clearUserProfile: () => {
        set({
          userProfile: null,
          isLoading: false,
          error: null,
          lastFetched: null,
        });
      },

      // Refresh user profile (force fetch)
      refreshUserProfile: async (userId: string) => {
        await get().fetchUserProfile(userId);
      },

      // Check if stored data is stale
      isDataStale: (maxAgeMinutes = 30) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;

        const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
        return Date.now() - lastFetched > maxAge;
      },
    }),
    {
      name: "user-storage", // Storage key
      storage: createJSONStorage(() => mobileStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        userProfile: state.userProfile,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
