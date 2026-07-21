import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAnonymousDefault?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (user, token) => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync('jwt_token', token);
    } else {
      // On web, cookies are preferred but fallback to localStorage if needed
      localStorage.setItem('jwt_token', token);
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('jwt_token');
    } else {
      localStorage.removeItem('jwt_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    }));
  },

  restoreToken: async () => {
    let token = null;
    if (Platform.OS !== 'web') {
      token = await SecureStore.getItemAsync('jwt_token');
    } else {
      token = localStorage.getItem('jwt_token');
    }
    
    if (token) {
      // Typically you'd decode or validate the token here
      set({ token, isAuthenticated: true });
    }
  }
}));
