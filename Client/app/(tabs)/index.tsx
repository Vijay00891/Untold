import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity, Image, RefreshControl, Platform, UIManager, LayoutAnimation, Animated } from 'react-native';
import { PostEntry } from '../../components/ui/PostEntry';
import { IconButton } from '../../components/ui/IconButton';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { usePostStore } from '../../store/usePostStore';
import { useChatStore } from '../../store/useChatStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/apiClient';

function PostSkeleton() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View 
      style={{ opacity }} 
      className="mb-4 bg-card border border-border rounded-2xl p-5 shadow-xs"
    >
      {/* Avatar block */}
      <View className="flex-row items-center mb-4">
        <View className="w-9 h-9 rounded-full bg-border" />
        <View className="ml-3 flex-1">
          <View className="w-24 h-4 bg-border rounded-md" />
          <View className="w-16 h-3 bg-border rounded-md mt-1.5" />
        </View>
      </View>

      {/* Content blocks */}
      <View className="w-full h-4 bg-border rounded-md mb-2" />
      <View className="w-5/6 h-4 bg-border rounded-md mb-2" />
      <View className="w-2/3 h-4 bg-border rounded-md mb-5" />

      {/* Hairline Divider inside card */}
      <View className="h-[1px] bg-border mb-3" />

      {/* Footer skeleton */}
      <View className="flex-row items-center justify-between">
        <View className="w-12 h-5 bg-border rounded-md" />
        <View className="w-24 h-5 bg-border rounded-md" />
      </View>
    </Animated.View>
  );
}

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

  // Smooth layout animation on posts update (e.g. Socket adds, Liked, or pull-to-refresh completes)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [posts]);

  const showSkeleton = loading && posts.length === 0;

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
        data={showSkeleton ? ([1, 2, 3] as any[]) : posts}
        keyExtractor={(item, index) => showSkeleton ? `skeleton-${index}` : (item as any).id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchFeed} colors={['#B3542E']} />
        }
        renderItem={({ item }) => {
          if (showSkeleton) return <PostSkeleton />;
          const post = item as any;
          return (
            <PostEntry 
              {...post} 
              onLike={() => toggleLike(post.id)}
              onRelate={() => handleRelatePress(post)}
            />
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !showSkeleton ? (
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="font-serif italic text-inkMuted text-base text-center">
                Nothing here yet. Be the first to share something.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
