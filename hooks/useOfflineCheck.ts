import { useCallback } from "react";
import { useNetInfoStore } from "@/store/netInfoStore";

/**
 * Hook to check internet connection before making API calls
 * Shows offline modal if user is offline and prevents the API call
 */
export function useOfflineCheck() {
  const { isConnected, showOfflineModal, checkConnection } = useNetInfoStore();

  /**
   * Checks if user is online before executing a function
   * @param apiCall - The async function to execute if online
   * @returns Promise that resolves with the API call result or rejects if offline
   */
  const executeWithOfflineCheck = useCallback(
    async <T,>(apiCall: () => Promise<T>): Promise<T> => {
      // First, check current connection status
      const isOnline = await checkConnection();
      
      if (!isOnline) {
        // Show offline modal and reject the promise
        showOfflineModal();
        throw new Error("No internet connection");
      }
      
      // If online, execute the API call
      return apiCall();
    },
    [checkConnection, showOfflineModal]
  );

  /**
   * Synchronous check for offline status
   * @returns true if offline, false if online
   */
  const isOffline = useCallback(() => {
    return isConnected === false;
  }, [isConnected]);

  /**
   * Show offline modal manually
   */
  const showOffline = useCallback(() => {
    showOfflineModal();
  }, [showOfflineModal]);

  return {
    executeWithOfflineCheck,
    isOffline,
    showOffline,
    isConnected,
  };
}
