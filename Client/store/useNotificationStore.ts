import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'request' | 'accept' | 'message';
  title: string;
  body: string;
  unread: boolean;
  data: any;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await apiClient.get<Notification[]>('/notifications');
      const unreadCount = data.filter((n) => n.unread).length;
      set({ notifications: data, unreadCount, loading: false });
    } catch (err) {
      console.warn('Fetch notifications error:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.patch<Notification>(`/notifications/${id}/read`, {});
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        );
        const unreadCount = updated.filter((n) => n.unread).length;
        return { notifications: updated, unreadCount };
      });
    } catch (err) {
      console.warn('Mark notification as read error:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.put('/notifications/read-all', {});
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, unread: false }));
        return { notifications: updated, unreadCount: 0 };
      });
    } catch (err) {
      console.warn('Mark all notifications as read error:', err);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Avoid duplicate notifications (e.g. if re-received)
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }
      const updated = [notification, ...state.notifications];
      const unreadCount = updated.filter((n) => n.unread).length;
      return { notifications: updated, unreadCount };
    });
  },
}));
