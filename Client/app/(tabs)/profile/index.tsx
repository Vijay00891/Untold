import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { PostEntry } from '../../../components/ui/PostEntry';
import { IconButton } from '../../../components/ui/IconButton';
import { Settings, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';

const MOCK_MY_POSTS = [
  {
    id: '3',
    isAnonymous: true,
    content: 'Just reached out to my estranged father after 5 years. Im terrified but hopeful.',
    timestamp: '1 day ago',
    likeCount: 89,
  }
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

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
      
      <ScrollView className="flex-1">
        <View className="flex-row items-center p-6 border-b border-border bg-background">
          <Avatar size={64} name={user?.name || 'Demo User'} imageUri={user?.avatarUrl} />
          <View className="ml-4">
            <Text className="text-lg font-serif font-semibold text-ink">
              {user?.name || 'Demo User'}
            </Text>
            <Text className="font-sans text-inkMuted text-sm mt-0.5">
              {user?.email || 'user@example.com'}
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
          
          {MOCK_MY_POSTS.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="font-serif italic text-inkMuted text-base text-center">
                Nothing here yet.
              </Text>
            </View>
          ) : (
            MOCK_MY_POSTS.map(post => (
              <PostEntry key={post.id} {...post} authorName={user?.name} authorImage={user?.avatarUrl} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
