import { create } from "zustand";

// Try to import expo-network, but provide fallback
let Network: any;
try {
  Network = require("expo-network");
} catch (error) {
  console.warn("expo-network not available, using fallback");
  Network = null;
}

interface NetInfoState {
  isConnected: boolean | null;
  isOfflineModalVisible: boolean;

  // Actions
  checkConnection: () => Promise<boolean>;
  showOfflineModal: () => void;
  hideOfflineModal: () => void;
  initializeNetInfo: () => () => void;
}

export const useNetInfoStore = create<NetInfoState>((set, get) => ({
  isConnected: null,
  isOfflineModalVisible: false,

  // Check current connection status
  checkConnection: async (): Promise<boolean> => {
    try {
      if (Network && Network.getNetworkStateAsync) {
        // Use Expo Network if available
        const networkState = await Network.getNetworkStateAsync();
        const isConnected = Boolean(
          networkState.isConnected &&
          networkState.type !== Network.NetworkStateType.NONE,
        );
        set({ isConnected });
        return isConnected;
      } else {
        // Fallback: try a simple fetch to check connectivity
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          const response = await fetch("https://google.com", {
            method: "HEAD",
            cache: "no-cache",
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          const isConnected = response.ok;
          set({ isConnected });
          return isConnected;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          set({ isConnected: false });
          return false;
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      set({ isConnected: false });
      return false;
    }
  },

  // Show offline modal
  showOfflineModal: () => {
    set({ isOfflineModalVisible: true });
  },

  // Hide offline modal
  hideOfflineModal: () => {
    set({ isOfflineModalVisible: false });
  },

  // Initialize Network listener
  initializeNetInfo: () => {
    // Check initial connection
    get().checkConnection();

    // Expo Network doesn't have a built-in listener like NetInfo
    // We'll use a polling approach for connection changes
    const interval = setInterval(async () => {
      const wasConnected = get().isConnected;
      const isConnected = await get().checkConnection();

      // Auto-hide offline modal when connection is restored
      if (isConnected && !wasConnected && get().isOfflineModalVisible) {
        set({ isOfflineModalVisible: false });
      }
    }, 5000); // Check every 5 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  },
}));
