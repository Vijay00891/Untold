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
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('jwt_token', token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      } else {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('jwt_token');
        await SecureStore.deleteItemAsync('user_data');
      } else {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    } catch (e) {
      console.warn('Storage delete error:', e);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...data } : null;
      if (updatedUser) {
        if (Platform.OS !== 'web') {
          SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser)).catch(() => {});
        } else {
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
      }
      return { user: updatedUser };
    });
  },

  restoreToken: async () => {
    try {
      let token: string | null = null;
      let userDataStr: string | null = null;

      if (Platform.OS !== 'web') {
        token = await SecureStore.getItemAsync('jwt_token');
        userDataStr = await SecureStore.getItemAsync('user_data');
      } else {
        token = localStorage.getItem('jwt_token');
        userDataStr = localStorage.getItem('user_data');
      }
      
      if (token) {
        let user: User | null = null;
        if (userDataStr) {
          try {
            user = JSON.parse(userDataStr);
          } catch {
            user = null;
          }
        }
        set({ token, user, isAuthenticated: true });
      }
    } catch (e) {
      console.warn('Restore session error:', e);
    }
  }
}));
