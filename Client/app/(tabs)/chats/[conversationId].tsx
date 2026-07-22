import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { IconButton } from '../../../components/ui/IconButton';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../api/apiClient';

type ChatState = 'no_message' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

const EXISTING_MESSAGES = [
  { id: '1', body: 'I completely relate to what you posted...', isMine: false, isAnonymous: true },
  { id: '2', body: 'Thank you, it means a lot to know I am not alone.', isMine: true, isAnonymous: false }
];

export default function ConversationScreen() {
  const { conversationId, postId, postContent, authorName, authorId, isAnonymous: isAnonymousParam } = useLocalSearchParams<{
    conversationId: string;
    postId?: string;
    postContent?: string;
    authorName?: string;
    authorId?: string;
    isAnonymous?: string;
  }>();
  const router = useRouter();

  // If we arrived here via "Relate to this", start in no_message state
  // If it's an existing conversation, start in the appropriate state
  const isNewConversation = !!postId;
  const isAnonymous = isAnonymousParam === 'true';
  const displayName = isAnonymous ? 'Anonymous' : (authorName || 'Anonymous');

  const [chatState, setChatState] = useState<ChatState>(isNewConversation ? 'no_message' : 'pending_received');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentMessages, setSentMessages] = useState<Array<{ id: string; body: string; isMine: boolean; isAnonymous: boolean }>>([]);

  const messages = isNewConversation ? sentMessages : EXISTING_MESSAGES;

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    const text = message.trim();
    const newMsg = {
      id: Date.now().toString(),
      body: text,
      isMine: true,
      isAnonymous: false,
    };
    
    setSentMessages(prev => [...prev, newMsg]);
    setMessage('');
    
    if (chatState === 'no_message') {
      setChatState('pending_sent');
      setLoading(true);
      try {
        // Wire up backend POST /message-requests endpoint if authorId exists
        if (authorId) {
          await apiClient.post('/message-requests', {
            receiverId: authorId,
            body: text,
          });
        }
      } catch (err) {
        console.warn('API sync warning (backend local mode):', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      if (conversationId && !conversationId.startsWith('new-')) {
        await apiClient.post(`/message-requests/${conversationId}/accept`, {});
      }
      setChatState('accepted');
    } catch (err) {
      console.warn('Accept request error:', err);
      setChatState('accepted'); // UI optimistic update
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
      setChatState('declined'); // UI optimistic update
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
    if (messages.length === 0) return null;
    return (
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: 16, flexDirection: 'column-reverse' }}
        renderItem={({ item }) => (
          <View className={`mb-3 max-w-[75%] rounded-2xl px-4 py-3 ${
            item.isMine ? 'bg-accent self-end' : 'bg-card border border-border self-start'
          }`}>
            <Text className={`font-sans text-base leading-relaxed ${item.isMine ? 'text-white' : 'text-ink'} ${!item.isMine && item.isAnonymous ? 'font-mono text-sm' : ''}`}>
              {item.body}
            </Text>
          </View>
        )}
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
