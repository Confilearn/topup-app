import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { publicAPI } from "@/lib/api";

// Referral settings interface - matches server response structure
interface ReferralSettings {
  referralAmount: number;
  userBonus: number;
  referralEnabled: boolean;
  disabledMessage: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Referral settings store interface
interface ReferralSettingsStore {
  // State
  settings: ReferralSettings | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchReferralSettings: () => Promise<void>;
  clearReferralSettings: () => void;
  isDataStale: (maxAgeMinutes?: number) => boolean;
  isReferralEnabled: () => boolean;
  getDisabledMessage: () => string;
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

// Create referral settings store with persistence
export const useReferralSettingsStore = create<ReferralSettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      // Fetch referral settings from server
      fetchReferralSettings: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await publicAPI.getReferralSettings();

          // Store settings locally
          const settings: ReferralSettings = {
            referralAmount: response.data.referralAmount || 300,
            userBonus: response.data.userBonus || 200,
            referralEnabled: response.data.referralEnabled !== false, // Default to true
            disabledMessage:
              response.data.disabledMessage ||
              "Referral features are currently disabled. Please check back later.",
            updatedBy: response.data.updatedBy,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
          };

          set({
            settings,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
          });
        } catch (error) {
          console.error("Failed to fetch referral settings:", error);
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch referral settings",
          });
        }
      },

      // Clear referral settings
      clearReferralSettings: () => {
        set({
          settings: null,
          error: null,
          lastFetched: null,
        });
      },

      // Check if stored data is stale (older than specified minutes)
      isDataStale: (maxAgeMinutes = 30) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;

        const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
        return Date.now() - lastFetched > maxAge;
      },

      // Check if referral is enabled
      isReferralEnabled: () => {
        const { settings } = get();
        return settings?.referralEnabled !== false; // Default to true if null
      },

      // Get disabled message
      getDisabledMessage: () => {
        const { settings } = get();
        return (
          settings?.disabledMessage ||
          "Referral features are currently disabled. Please check back later."
        );
      },
    }),
    {
      name: "referral-settings-storage",
      storage: createJSONStorage(() => mobileStorage),
      // Only persist essential data
      partialize: (state) => ({
        settings: state.settings,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
