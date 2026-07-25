import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';

// In a real app this would come from env
// Since Vercel is used in production, dynamically resolve backend URL
const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? 'https://untold-backend-gvff.onrender.com'
  : 'http://localhost:3000';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string; // encrypted
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  connect: () => void;
  disconnect: () => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, body: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  activeConversationId: null,
  messages: {},
  
  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (get().socket) return; // Already connected

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('new_message', (message: Message) => {
      get().addMessage(message);
    });

    socket.on('notification:new', (notification: any) => {
      useNotificationStore.getState().addNotification(notification);
    });

    set({ socket });
  },
  
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id });
  },

  addMessage: (message) => {
    set((state) => {
      const convoMessages = state.messages[message.conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...convoMessages, message]
        }
      };
    });
  },

  sendMessage: (conversationId, body) => {
    const { socket } = get();
    if (!socket) return;

    // Optimistically add message could be done here before emitting
    
    socket.emit('send_message', {
      conversationId,
      body, // Should be encrypted before this step
    });
  }
}));
