import React, { useEffect, useState } from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { useRouter } from 'expo-router';
import { apiClient } from '../../../api/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';

interface ChatItem {
  id: string;
  isRequest: boolean;
  authorName: string;
  isAnonymous: boolean;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  authorId: string;
}

export default function ChatsScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchChatsList = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      // Parallel fetch for active conversations and pending message requests
      const [convosData, requestsData] = await Promise.all([
        apiClient.get<any[]>('/conversations'),
        apiClient.get<{ incoming: any[]; sent: any[] }>('/message-requests'),
      ]);

      const mappedRequests = requestsData.incoming.map((req: any) => ({
        id: req.id,
        isRequest: true,
        authorName: req.sender_name || 'Anonymous',
        isAnonymous: req.sender_name === 'Anonymous' || !req.sender_name,
        lastMessage: req.first_message,
        timestamp: req.created_at,
        unread: req.status === 'pending',
        authorId: req.sender_id,
      }));

      const mappedConvos = convosData.map((convo: any) => ({
        id: convo.conversation_id,
        isRequest: false,
        authorName: convo.other_user_name || 'Anonymous',
        isAnonymous: convo.other_user_name === 'Anonymous' || !convo.other_user_name,
        lastMessage: convo.last_message || '',
        timestamp: convo.last_message_at || convo.created_at,
        unread: false,
        authorId: convo.other_user_id,
      }));

      // Merge and sort by timestamp descending
      const combined = [...mappedRequests, ...mappedConvos].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setChats(combined);
    } catch (err) {
      console.warn('Fetch chats list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatsList();
  }, [isAuthenticated]);

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      className={`flex-row items-center py-4 px-4 border-b border-border bg-background`}
      onPress={() => router.push({
        pathname: '/(tabs)/chats/[conversationId]',
        params: {
          conversationId: item.id,
          authorId: item.authorId,
          authorName: item.authorName,
          isAnonymous: item.isAnonymous ? 'true' : 'false',
          // If it's a message request, pass a flag so the subpage knows it needs to show accept/decline
          isRequestPending: item.isRequest ? 'true' : 'false',
          firstMessage: item.isRequest ? item.lastMessage : '',
        }
      })}
      activeOpacity={0.7}
    >
      <View>
        <Avatar 
          name={item.authorName} 
          isAnonymous={item.isAnonymous} 
          size={48} 
        />
      </View>
      
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className={`font-serif font-semibold text-ink text-base`}>
            {item.isAnonymous ? 'Anonymous' : item.authorName}
          </Text>
          <View className="items-end">
            <Text className={`font-sans text-xs ${item.unread ? 'text-accent font-semibold' : 'text-inkMuted'}`}>
              {formatRelativeTime(item.timestamp)}
            </Text>
            {item.isRequest && (
              <Badge text="REQ" className="mt-1" />
            )}
          </View>
        </View>
        <Text 
          className={`font-sans text-sm ${item.unread ? 'text-ink font-medium' : 'text-inkMuted'} ${item.isAnonymous ? 'font-mono text-xs' : ''}`}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 bg-navbar border-b border-border justify-center">
        <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Chats</Text>
      </View>
      
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchChatsList} colors={['#B3542E']} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="font-serif italic text-inkMuted text-base text-center">
              No chats yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
