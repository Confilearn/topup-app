import { useEffect, useRef, useState } from "react";
import { useTransactionStore } from "@/store/transactionStore";
import { vtuAPI } from "@/lib/api";

interface TransactionPollingOptions {
  pollInterval?: number; // in milliseconds
  maxAttempts?: number;
  enabled?: boolean;
}

/**
 * Hook for polling transaction status updates
 * Provides real-time transaction tracking without WebSocket
 */
export const useTransactionPolling = (
  options: TransactionPollingOptions = {},
) => {
  const {
    pollInterval = 5000, // 5 seconds default
    maxAttempts = 20, // Maximum 20 attempts (100 seconds total)
    enabled = true,
  } = options;

  const { updateTransactionStatus } = useTransactionStore();
  const [isPolling, setIsPolling] = useState(false);
  const [polledTransactions, setPolledTransactions] = useState<Set<string>>(
    new Set(),
  );
  const pollingIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );
  const attemptCounts = useRef<Map<string, number>>(new Map());

  /**
   * Start polling for a specific transaction
   */
  const startPolling = (reference: string) => {
    if (!enabled || polledTransactions.has(reference)) {
      return;
    }

    console.log(`🔄 Starting transaction polling for ${reference}`);
    setPolledTransactions((prev) => new Set([...prev, reference]));
    setIsPolling(true);
    attemptCounts.current.set(reference, 0);

    const pollTransaction = async () => {
      try {
        const currentAttempts = attemptCounts.current.get(reference) || 0;

        // Stop polling if max attempts reached
        if (currentAttempts >= maxAttempts) {
          console.log(`⏹️ Max polling attempts reached for ${reference}`);
          stopPolling(reference);
          return;
        }

        console.log(
          `🔍 Polling transaction status for ${reference} (attempt ${currentAttempts + 1})`,
        );

        const response = await vtuAPI.getTransactionStatus(reference);

        if (response?.data?.status) {
          const { status } = response.data;

          console.log(`📊 Transaction ${reference} status: ${status}`);

          // Update transaction in store
          updateTransactionStatus(reference, {
            status: status.toLowerCase() as "pending" | "completed" | "failed",
            updatedAt: new Date().toISOString(),
            // Note: message and data are not part of Transaction interface
            // We'll store them in a separate error tracking system if needed
          });

          // Stop polling if transaction is completed or failed
          if (status === "completed" || status === "failed") {
            console.log(
              `✅ Transaction ${reference} finalized with status: ${status}`,
            );
            stopPolling(reference);
            return;
          }
        }

        // Increment attempt count
        attemptCounts.current.set(reference, currentAttempts + 1);
      } catch (error) {
        console.error(`❌ Error polling transaction ${reference}:`, error);

        const currentAttempts = attemptCounts.current.get(reference) || 0;
        attemptCounts.current.set(reference, currentAttempts + 1);

        // Stop polling after several consecutive errors
        if (currentAttempts >= 3) {
          console.log(`⏹️ Too many errors polling ${reference}, stopping`);
          updateTransactionStatus(reference, {
            status: "failed",
            updatedAt: new Date().toISOString(),
            // Note: message is not part of Transaction interface
          });
          stopPolling(reference);
        }
      }
    };

    // Start immediate poll, then set up interval
    pollTransaction();
    const intervalId = setInterval(pollTransaction, pollInterval);
    pollingIntervals.current.set(reference, intervalId);
  };

  /**
   * Stop polling for a specific transaction
   */
  const stopPolling = (reference: string) => {
    const intervalId = pollingIntervals.current.get(reference);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervals.current.delete(reference);
    }

    attemptCounts.current.delete(reference);
    setPolledTransactions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(reference);
      return newSet;
    });

    // Update overall polling state
    if (pollingIntervals.current.size === 0) {
      setIsPolling(false);
    }
  };

  /**
   * Start polling for multiple pending transactions
   */
  const pollPendingTransactions = (transactions: any[]) => {
    const pendingTransactions = transactions.filter(
      (tx) => tx.status === "pending" && !polledTransactions.has(tx.reference),
    );

    console.log(
      `🔄 Found ${pendingTransactions.length} pending transactions to poll`,
    );

    pendingTransactions.forEach((transaction) => {
      startPolling(transaction.reference);
    });
  };

  /**
   * Cleanup all polling intervals
   */
  const cleanup = () => {
    console.log("🧹 Cleaning up all transaction polling");

    pollingIntervals.current.forEach((intervalId, reference) => {
      clearInterval(intervalId);
    });

    pollingIntervals.current.clear();
    attemptCounts.current.clear();
    setPolledTransactions(new Set());
    setIsPolling(false);
  };

  // Auto-cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    isPolling,
    polledTransactions: Array.from(polledTransactions),
    startPolling,
    stopPolling,
    pollPendingTransactions,
    cleanup,
  };
};
