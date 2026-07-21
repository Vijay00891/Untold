import React, { useState } from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity, Image } from 'react-native';
import { PostEntry } from '../../components/ui/PostEntry';
import { IconButton } from '../../components/ui/IconButton';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MOCK_POSTS = [
  {
    id: '1',
    authorName: 'Sarah J',
    isAnonymous: false,
    content: 'I recently left a job that looked perfect on paper but was destroying my mental health. Best decision I ever made.',
    timestamp: '2 hours ago',
    likeCount: 42,
  },
  {
    id: '2',
    isAnonymous: true,
    content: 'Sometimes I feel like everyone else has a manual for life that I never received. Navigating adulthood feels like guessing the answers on a test I didn\'t study for.',
    timestamp: '5 hours ago',
    likeCount: 128,
  },
  {
    id: '3',
    isAnonymous: true,
    content: 'Just reached out to my estranged father after 5 years. Im terrified but hopeful.',
    timestamp: '1 day ago',
    likeCount: 89,
  }
];

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState(MOCK_POSTS.map(post => ({ ...post, isLiked: false })));

  const handleLike = (id: string) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === id) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1
          };
        }
        return post;
      })
    );
  };

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
          <View className="absolute right-2 top-2 w-2.5 h-2.5 bg-seal rounded-full border-2 border-background" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostEntry 
            {...item} 
            onLike={() => handleLike(item.id)}
            onRelate={() => router.push({
              pathname: '/(tabs)/chats/[conversationId]',
              params: {
                conversationId: `new-${item.id}`,
                postId: item.id,
                postContent: item.content,
                authorName: item.authorName || '',
                isAnonymous: item.isAnonymous ? 'true' : 'false',
              }
            })}
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
