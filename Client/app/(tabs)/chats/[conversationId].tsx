import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../api/apiClient';
import { useChatStore } from '../../../store/useChatStore';
import { useAuthStore } from '../../../store/useAuthStore';

type ChatState = 'no_message' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

export default function ConversationScreen() {
  const { conversationId, postId, postContent, authorName, authorId, isAnonymous: isAnonymousParam, isRequestPending, firstMessage } = useLocalSearchParams<{
    conversationId: string;
    postId?: string;
    postContent?: string;
    authorName?: string;
    authorId?: string;
    isAnonymous?: string;
    isRequestPending?: string;
    firstMessage?: string;
  }>();
  const router = useRouter();

  const isNewConversation = !conversationId || conversationId.startsWith('new-');
  const isAnonymous = isAnonymousParam === 'true';
  const displayName = isAnonymous ? 'Anonymous' : (authorName || 'Anonymous');

  const currentUser = useAuthStore((state) => state.user);

  // Zustand chat store hook
  const activeMessages = useChatStore((state) => state.messages[conversationId] || []);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const loadingMessages = useChatStore((state) => state.loading);

  const initialChatState = () => {
    if (isNewConversation) return 'no_message';
    if (isRequestPending === 'true') return 'pending_received';
    return 'accepted';
  };

  const [chatState, setChatState] = useState<ChatState>(initialChatState());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Manage socket rooms and fetch initial messages on mount
  useEffect(() => {
    if (!isNewConversation && conversationId) {
      setActiveConversation(conversationId);
      fetchMessages(conversationId);
    }

    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, isNewConversation]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    const text = message.trim();
    setMessage('');
    
    if (chatState === 'no_message') {
      setChatState('pending_sent');
      setLoading(true);
      try {
        if (authorId) {
          await apiClient.post('/message-requests', {
            receiverId: authorId,
            body: text,
          });
        }
      } catch (err) {
        console.warn('API sync warning:', err);
      } finally {
        setLoading(false);
      }
    } else if (chatState === 'accepted') {
      await sendMessage(conversationId, text);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      if (conversationId && !conversationId.startsWith('new-')) {
        await apiClient.post(`/message-requests/${conversationId}/accept`, {});
      }
      setChatState('accepted');
      // Fetch messages so we load the accepted chat logs
      fetchMessages(conversationId);
    } catch (err) {
      console.warn('Accept request error:', err);
      setChatState('accepted'); 
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      if (conversationId && !conversationId.startsWith('new-')) {
        await apiClient.post(`/message-requests/${conversationId}/decline`, {});
      }
      setChatState('declined');
    } catch (err) {
      console.warn('Decline request error:', err);
      setChatState('declined'); 
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="px-4 h-14 bg-background border-b border-border flex-row items-center z-10">
      <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
      <Avatar isAnonymous={isAnonymous || !authorName} name={displayName} size={32} />
      <Text className="text-lg font-serif font-semibold text-ink ml-3 mt-1">{displayName}</Text>
    </View>
  );

  const renderPostContext = () => {
    if (!postContent) return null;
    return (
      <View className="mx-4 mt-4 mb-2 p-4 bg-card border border-border rounded-xl">
        <Text className="font-sans text-xs text-inkMuted mb-2">Replying to their post</Text>
        <Text className={`text-ink leading-6 ${isAnonymous ? 'font-mono text-sm' : 'font-serif text-[15px]'}`} numberOfLines={4}>
          {postContent}
        </Text>
      </View>
    );
  };

  const renderMessageList = () => {
    if (chatState === 'pending_received' && firstMessage) {
      // In pending state show incoming request message preview
      return (
        <View className="flex-1 p-4 justify-center items-center">
          <View className="max-w-[85%] bg-card border border-border rounded-2xl p-4 shadow-xs">
            <Text className="font-sans text-xs text-inkMuted mb-2">Their message request body:</Text>
            <Text className="font-sans text-base text-ink leading-relaxed font-mono">
              {firstMessage}
            </Text>
          </View>
        </View>
      );
    }

    if (loadingMessages && activeMessages.length === 0) {
      return (
        <View className="flex-grow justify-center items-center">
          <ActivityIndicator size="small" color="#B3542E" />
        </View>
      );
    }

    return (
      <FlatList
        data={activeMessages}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUser?.id;
          return (
            <View className={`mb-3 max-w-[75%] rounded-2xl px-4 py-3 ${
              isMine ? 'bg-accent self-end' : 'bg-card border border-border self-start'
            }`}>
              <Text className={`font-sans text-base leading-relaxed ${isMine ? 'text-white' : 'text-ink'}`}>
                {item.body}
              </Text>
            </View>
          );
        }}
      />
    );
  };

  const renderInputArea = () => {
    let placeholder = "Write your message...";
    let disabled = false;
    let showAcceptDecline = false;
    let bannerText: string | null = null;

    switch (chatState) {
      case 'no_message':
        bannerText = "This will be your first message. They can accept or decline your request to chat.";
        placeholder = "Tell them why you relate...";
        break;
      case 'pending_sent':
        disabled = true;
        bannerText = "Message request sent! Waiting for them to accept your request before sending more.";
        placeholder = "Waiting for them to accept your request...";
        break;
      case 'pending_received':
        disabled = true;
        placeholder = "Accept request to reply...";
        showAcceptDecline = true;
        bannerText = "They would like to connect with you about your post.";
        break;
      case 'declined':
        disabled = true;
        bannerText = "This conversation request was declined. No further messages can be sent.";
        placeholder = "Conversation declined.";
        break;
    }

    return (
      <View className="bg-background border-t border-border p-4 mb-safe">
        {bannerText && (
          <View className="bg-card border border-border rounded-xl p-3 mb-3">
            <Text className="text-inkMuted font-sans text-xs text-center leading-5">
              {bannerText}
            </Text>
          </View>
        )}
        
        {showAcceptDecline && (
          <View className="flex-row justify-center space-x-3 mb-4 gap-3">
            <View className="flex-1">
              <Button variant="secondary" title="Decline" onPress={handleDecline} disabled={loading} />
            </View>
            <View className="flex-1">
              <Button variant="primary" title="Accept" onPress={handleAccept} disabled={loading} />
            </View>
          </View>
        )}
        
        {!showAcceptDecline && (
          <View className="flex-row items-center">
            <TextInput
              className={`flex-1 bg-card border border-border rounded-full px-4 py-2 min-h-[44px] font-sans text-ink ${disabled ? 'opacity-60 text-inkMuted bg-border/20' : ''}`}
              placeholder={placeholder}
              placeholderTextColor="#6E6659"
              value={message}
              onChangeText={setMessage}
              editable={!disabled && !loading}
              autoFocus={isNewConversation && chatState === 'no_message'}
            />
            <IconButton 
              icon={Send} 
              size={18} 
              color={!message.trim() || disabled || loading ? '#6E6659' : '#FFFFFF'}
              className={`ml-2 rounded-full w-11 h-11 ${!message.trim() || disabled || loading ? 'bg-border' : 'bg-accent'}`}
              disabled={!message.trim() || disabled || loading}
              onPress={handleSend}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {renderHeader()}
        <View className="flex-1 bg-background">
          {renderPostContext()}
          {renderMessageList()}
        </View>
        {renderInputArea()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
