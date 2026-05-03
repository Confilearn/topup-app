import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, userAPI, initializeAuth, TokenStorage } from "@/lib/api";
import { useUserStore } from "./userStore";
import { useNetInfoStore } from "./netInfoStore";
import { useReferralStore } from "./referralStore";
import { useTransactionStore } from "./transactionStore";
import { useDepositStore } from "./depositStore";

// User interface - matches server response structure
interface User {
  id: string;
  username: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  accountStatus?: string;
  transactionPin?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    referredBy?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
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
      // Silently fail
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Silently fail
    }
  },
};

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Check offline status before making API call
          const netInfoStore = useNetInfoStore.getState();
          const isConnected = await netInfoStore.checkConnection();

          if (!isConnected) {
            netInfoStore.showOfflineModal();
            set({ isLoading: false });
            return false;
          }

          const response = await authAPI.login(email, password);

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Signup action
      signup: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          // Check offline status before making API call
          const netInfoStore = useNetInfoStore.getState();
          const isConnected = await netInfoStore.checkConnection();

          if (!isConnected) {
            netInfoStore.showOfflineModal();
            set({ isLoading: false });
            return false;
          }

          await authAPI.register(userData);

          // Note: Server doesn't return token on signup, user needs to login
          set({
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear auth state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear all user-related data from other stores
          const { clearUserProfile } = useUserStore.getState();
          const { clearReferralHistory } = useReferralStore.getState();
          const { clearTransactions } = useTransactionStore.getState();
          const { clearDepositHistory } = useDepositStore.getState();

          clearUserProfile();
          clearReferralHistory();
          clearTransactions();
          clearDepositHistory();
        }
      },

      // Update password action
      updatePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });

        try {
          // Check offline status before making API call
          const netInfoStore = useNetInfoStore.getState();
          const isConnected = await netInfoStore.checkConnection();

          if (!isConnected) {
            netInfoStore.showOfflineModal();
            set({ isLoading: false });
            return false;
          }

          console.log("Proceeding with password update API call...");
          await authAPI.updatePassword(currentPassword, newPassword);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Password update failed";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Update profile action
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Starting profile update...");
          // Check offline status before making API call
          const netInfoStore = useNetInfoStore.getState();
          const isConnected = await netInfoStore.checkConnection();

          console.log("Profile update - isConnected:", isConnected);
          if (!isConnected) {
            console.log(
              "Showing offline modal for profile update - EARLY RETURN",
            );
            netInfoStore.showOfflineModal();
            set({ isLoading: false });
            return;
          }

          console.log("Proceeding with profile update API call...");
          // Check if user exists and get user ID
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("No authenticated user found");
          }

          console.log("About to call userAPI.updateProfile...");
          // Call the backend API to update profile
          const response = await userAPI.updateProfile(currentUser.id, data);

          console.log("Profile update response received...");
          // Update local state with the response from server
          set({
            user: response,
            isLoading: false,
            error: null,
          });

          // Also update the userStore to keep it in sync
          const userStore = useUserStore.getState();
          if (userStore.userProfile?.id === currentUser.id) {
            userStore.updateUserProfile(response);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Profile update failed";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Forgot password action
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          // Check offline status before making API call
          const netInfoStore = useNetInfoStore.getState();
          const isConnected = await netInfoStore.checkConnection();

          if (!isConnected) {
            netInfoStore.showOfflineModal();
            set({ isLoading: false });
            return false;
          }

          await authAPI.forgotPassword(email);
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to send reset email";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      // Clear error action
      clearError: () => {
        set({ error: null });
      },

      // Check auth status
      checkAuth: async () => {
        set({ isLoading: true, error: null });

        try {
          const { user, isAuthenticated } = await initializeAuth();

          set({
            user,
            isAuthenticated,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Auth check failed";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => mobileStorage),
      // Only persist essential auth data
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle rehydration on app start
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Verify token is still valid
          TokenStorage.hasToken().then((hasToken) => {
            if (!hasToken && state.isAuthenticated) {
              // Clear invalid auth state
              useAuthStore.setState({
                user: null,
                isAuthenticated: false,
              });
            }
          });
        }
      },
    },
  ),
);
