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
  transactionPin?: string; // Add transaction pin field
  virtualAccount?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    provider: string;
    isActive: boolean;
  };
}

// User store interface
interface UserStore {
  // State
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch
  currentUserId: string | null; // Track current user for cache invalidation

  // Actions
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  refreshUserProfile: (userId: string) => Promise<void>;
  isDataStale: (maxAgeMinutes?: number) => boolean;
  createVirtualAccount: (bvn: string) => Promise<void>;
  hasVirtualAccount: () => boolean;
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
      currentUserId: null,

      // Fetch user profile from server
      fetchUserProfile: async (userId: string) => {
        const { currentUserId } = get();

        // Clear data if switching users
        if (currentUserId && currentUserId !== userId) {
          set({
            userProfile: null,
            lastFetched: null,
            error: null,
          });
        }

        set({ isLoading: true, error: null });

        try {
          // Fetch user profile from /user/profile/:id endpoint
          const response = await userAPI.getProfile(userId);
          console.log("Server response:", response);

          // Store non-sensitive user data locally
          const userData: UserProfile = {
            id: response.id || response._id,
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
            currentUserId: userId,
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
          currentUserId: null,
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

      // Create virtual account with BVN
      createVirtualAccount: async (bvn: string) => {
        console.log("createVirtualAccount called with BVN:", bvn);
        const { userProfile } = get();
        console.log("Current userProfile:", userProfile);

        // Get user ID from profile, auth store, or username as fallback
        let userId = userProfile?.id;

        if (!userId) {
          // Try to get from auth store
          try {
            const authStore = require("./authStore").useAuthStore.getState();
            userId =
              authStore.user?.id ||
              authStore.user?._id ||
              authStore.user?.username;
          } catch (e) {
            console.log("Could not access auth store");
          }
        }

        if (!userId) {
          userId = userProfile?.username;
        }

        if (!userId) {
          console.error("No user ID found");
          set({ error: "No user ID found" });
          return;
        }

        console.log("Setting loading to true");
        set({ isLoading: true, error: null });

        try {
          // Call the virtual account creation API
          console.log("Calling API with userId:", userId, "BVN:", bvn);
          const response = await userAPI.createVirtualAccount(userId, bvn);
          console.log("API response:", response);

          // Update user profile with virtual account info
          set((state) => ({
            userProfile: state.userProfile
              ? {
                  ...state.userProfile,
                  virtualAccount: {
                    ...response.virtualAccount,
                    isActive: true, // Add isActive field
                  },
                  isVerified:
                    response.isVerified || state.userProfile.isVerified,
                }
              : null,
            isLoading: false,
            error: null,
          }));
          console.log("Virtual account created and profile updated");
        } catch (error) {
          console.error("Failed to create virtual account:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create virtual account",
          });
        }
      },

      // Check if user has virtual account
      hasVirtualAccount: () => {
        const { userProfile } = get();
        return (
          !!userProfile?.virtualAccount && userProfile.virtualAccount.isActive
        );
      },
    }),
    {
      name: "user-storage", // Storage key
      storage: createJSONStorage(() => mobileStorage),
      // Only persist non-sensitive data
      partialize: (state) => ({
        userProfile: state.userProfile,
        lastFetched: state.lastFetched,
        currentUserId: state.currentUserId,
      }),
    },
  ),
);
