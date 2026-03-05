import { create } from 'zustand';
import { MOCK_TRANSACTIONS, Transaction } from '@/lib/mockData';

interface TransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  getTransaction: (id: string) => Transaction | undefined;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: MOCK_TRANSACTIONS,
  recentTransactions: MOCK_TRANSACTIONS.slice(0, 3),

  addTransaction: (tx: Transaction) => {
    set((state) => ({
      transactions: [tx, ...state.transactions],
      recentTransactions: [tx, ...state.transactions].slice(0, 3),
    }));
  },

  getTransaction: (id: string) => {
    return get().transactions.find((tx) => tx.id === id);
  },
}));
