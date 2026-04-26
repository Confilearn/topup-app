import { create } from "zustand";
import { MOCK_WALLET } from "@/lib/mockData";
import { useUserStore } from "./userStore";

interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  provider: string;
}

interface WalletState {
  balance: number;
  virtualAccount: VirtualAccount | null;
  hasVirtualAccount: boolean;
  createVirtualAccount: (bvn: string) => Promise<boolean>;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
  syncBalanceFromProfile: () => void; // New method to sync from user profile
  clearWalletData: () => void; // Method to clear wallet data on logout
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: MOCK_WALLET.balance,
  virtualAccount: MOCK_WALLET.virtualAccount,
  hasVirtualAccount: true,

  createVirtualAccount: async (_bvn: string) => {
    await new Promise((r) => setTimeout(r, 1200));
    set({
      virtualAccount: MOCK_WALLET.virtualAccount,
      hasVirtualAccount: true,
    });
    return true;
  },

  deductBalance: (amount: number) => {
    set((state) => ({ balance: Math.max(0, state.balance - amount) }));
  },

  addBalance: (amount: number) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  // Sync balance from user profile data
  syncBalanceFromProfile: () => {
    const userProfile = useUserStore.getState().userProfile;
    if (userProfile?.balance !== undefined) {
      set({ balance: userProfile.balance });
    }
  },

  // Clear wallet data on logout
  clearWalletData: () => {
    set({
      balance: 0,
      virtualAccount: null,
      hasVirtualAccount: false,
    });
  },
}));
