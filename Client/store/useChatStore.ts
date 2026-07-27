import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';
import { apiClient } from '../api/apiClient';

// Since Vercel is used in production, dynamically resolve backend URL
const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? 'https://untold-backend-gvff.onrender.com'
  : 'http://localhost:3000';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string; // encrypted/plain
  createdAt: string;
}

interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  body_encrypted: string;
  created_at: string;
}

const mapDBMessage = (dbMsg: DBMessage): Message => ({
  id: dbMsg.id,
  conversationId: dbMsg.conversation_id,
  senderId: dbMsg.sender_id,
  body: dbMsg.body_encrypted,
  createdAt: dbMsg.created_at,
});

interface ChatState {
  socket: Socket | null;
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  connect: () => void;
  disconnect: () => void;
  setActiveConversation: (id: string | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, body: string) => Promise<Message | null>;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  activeConversationId: null,
  messages: {},
  loading: false,
  
  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (get().socket) return; // Already connected

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      // If we are currently viewing a conversation, re-join it on reconnect
      const activeConvo = get().activeConversationId;
      if (activeConvo) {
        socket.emit('join:conversation', activeConvo);
      }
    });

    socket.on('message:new', (dbMsg: DBMessage) => {
      const msg = mapDBMessage(dbMsg);
      get().addMessage(msg);
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
    const { socket, activeConversationId } = get();
    
    // Handle socket room management
    if (socket) {
      if (activeConversationId) {
        socket.emit('leave:conversation', activeConversationId);
      }
      if (id) {
        socket.emit('join:conversation', id);
      }
    }
    
    set({ activeConversationId: id });
  },

  fetchMessages: async (conversationId) => {
    set({ loading: true });
    try {
      const response = await apiClient.get<{ messages: DBMessage[] }>(`/conversations/${conversationId}/messages`);
      const mapped = response.messages.map(mapDBMessage);
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: mapped.reverse() // Reverse to render top-to-bottom
        },
        loading: false
      }));
    } catch (err) {
      console.warn('Fetch messages error:', err);
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId, body) => {
    try {
      const dbMsg = await apiClient.post<DBMessage>(`/conversations/${conversationId}/messages`, {
        encryptedBody: body,
      });
      const msg = mapDBMessage(dbMsg);
      get().addMessage(msg);
      return msg;
    } catch (err) {
      console.warn('Send message error:', err);
      return null;
    }
  },

  addMessage: (message) => {
    set((state) => {
      const convoMessages = state.messages[message.conversationId] || [];
      // Avoid duplicate messages if socket broadcasts our own message back
      if (convoMessages.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...convoMessages, message]
        }
      };
    });
  },
}));
