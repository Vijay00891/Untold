import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { PostEntry } from '../../../components/ui/PostEntry';
import { IconButton } from '../../../components/ui/IconButton';
import { Settings, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';
import { usePostStore } from '../../../store/usePostStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const myPosts = usePostStore((state) => state.myPosts);
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const toggleLike = usePostStore((state) => state.toggleLike);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 bg-navbar border-b border-border flex-row justify-between items-center">
        <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Profile</Text>
        <IconButton 
          icon={Settings} 
          onPress={() => router.push('/settings')} 
          className="mr-[-8px]"
        />
      </View>
      
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchMyPosts} colors={['#B3542E']} />
        }
      >
        <View className="flex-row items-center p-6 border-b border-border bg-background">
          <Avatar size={64} name={user?.name || 'Google User'} imageUri={user?.avatarUrl} />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-serif font-semibold text-ink">
              {user?.name || 'Google User'}
            </Text>
            <Text className="font-sans text-inkMuted text-sm mt-0.5">
              {user?.email || 'user@gmail.com'}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <TouchableOpacity 
            className="flex-row items-center justify-between bg-transparent border border-border p-4 rounded-xl mb-8"
            onPress={() => router.push('/(tabs)/profile/edit')}
            activeOpacity={0.7}
          >
            <Text className="font-sans font-medium text-ink">Edit Profile</Text>
            <ChevronRight size={20} color="#6E6659" strokeWidth={1.5} />
          </TouchableOpacity>

          <Text className="text-lg font-serif font-semibold text-ink mb-6">My Posts</Text>
          
          {myPosts.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="font-serif italic text-inkMuted text-base text-center">
                You haven't created any posts yet.
              </Text>
            </View>
          ) : (
            myPosts.map((post) => (
              <PostEntry 
                key={post.id} 
                {...post} 
                authorName={post.isAnonymous ? 'Anonymous' : (user?.name || 'Google User')} 
                authorImage={post.isAnonymous ? undefined : user?.avatarUrl} 
                onLike={() => toggleLike(post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
