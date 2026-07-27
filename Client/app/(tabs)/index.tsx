import React, { useEffect } from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { PostEntry } from '../../components/ui/PostEntry';
import { IconButton } from '../../components/ui/IconButton';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}
import { usePostStore } from '../../store/usePostStore';
import { useChatStore } from '../../store/useChatStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/apiClient';
import { useState } from 'react';

export default function FeedScreen() {
  const router = useRouter();
  const posts = usePostStore((state) => state.posts);
  const loading = usePostStore((state) => state.loading);
  const fetchFeed = usePostStore((state) => state.fetchFeed);
  const toggleLike = usePostStore((state) => state.toggleLike);

  const connectSockets = useChatStore((state) => state.connect);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [checkingRelate, setCheckingRelate] = useState<string | null>(null);

  const handleRelatePress = async (item: any) => {
    if (checkingRelate) return;
    setCheckingRelate(item.id);
    try {
      // Query if an existing relationship (request or conversation) exists with this post's author
      const res = await apiClient.get<{ status: string; conversationId: string | null }>(
        `/message-requests/post-status/${item.id}`
      );
      
      if (res.conversationId && res.status !== 'none') {
        // Active or pending connection exists, route straight to it
        router.push({
          pathname: '/(tabs)/chats/[conversationId]',
          params: {
            conversationId: res.conversationId,
            authorName: item.authorName || 'Anonymous',
            isAnonymous: item.isAnonymous ? 'true' : 'false',
            isRequestPending: res.status === 'pending_received' ? 'true' : 'false',
            firstMessage: res.status === 'pending_received' ? item.content || item.body : '',
          }
        });
      } else {
        // Start a fresh request
        router.push({
          pathname: '/(tabs)/chats/[conversationId]',
          params: {
            conversationId: `new-${item.id}`,
            postId: item.id,
            postContent: item.content || item.body,
            authorName: item.authorName || '',
            authorId: item.authorId || '',
            isAnonymous: item.isAnonymous ? 'true' : 'false',
          }
        });
      }
    } catch (err) {
      console.warn('Relate check error:', err);
    } finally {
      setCheckingRelate(null);
    }
  };

  useEffect(() => {
    fetchFeed();
    if (isAuthenticated) {
      connectSockets();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row justify-between items-center bg-navbar border-b border-border">
        <View className="flex-row items-center">
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 28, height: 28, borderRadius: 6 }}
            className="mr-2"
            resizeMode="cover"
          />
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 22 }} className="text-ink">Untold</Text>
        </View>
        <TouchableOpacity 
          className="relative"
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <IconButton icon={Bell} size={24} onPress={() => router.push('/notifications')} />
          {/* Unread indicator */}
          {unreadCount > 0 && (
            <View className="absolute right-2 top-2 w-2.5 h-2.5 bg-seal rounded-full border-2 border-background" />
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFeed} colors={['#B3542E']} />
        }
        renderItem={({ item }) => (
          <PostEntry 
            {...item} 
            onLike={() => toggleLike(item.id)}
            onRelate={() => handleRelatePress(item)}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="font-serif italic text-inkMuted text-base text-center">
              Nothing here yet. Be the first to share something.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
