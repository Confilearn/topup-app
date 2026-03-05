import { create } from 'zustand';
import { MOCK_USER } from '@/lib/mockData';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  joinDate: string;
  accountStatus: string;
  referralCode: string;
  referralLink: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, _password: string) => {
    // Mock login - accept any credentials
    await new Promise((r) => setTimeout(r, 800));
    set({ user: MOCK_USER, isAuthenticated: true });
    return true;
  },

  signup: async (_data) => {
    await new Promise((r) => setTimeout(r, 1000));
    set({ user: MOCK_USER, isAuthenticated: true });
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));
