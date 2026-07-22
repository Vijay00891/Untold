import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { PostEntry } from '../../../components/ui/PostEntry';
import { IconButton } from '../../../components/ui/IconButton';
import { Button } from '../../../components/ui/Button';
import { Settings, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/useAuthStore';
import { usePostStore } from '../../../store/usePostStore';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const myPosts = usePostStore((state) => state.myPosts);
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const toggleLike = usePostStore((state) => state.toggleLike);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      fetchMyPosts();
    }
  }, [isAuthenticated, token, user]);

  // Logged-out state: If user is not logged in, display single Continue with Google option
  if (!isAuthenticated || !token || !user) {
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

        <View className="flex-1 justify-center items-center p-6">
          <View className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 items-center shadow-xs">
            <Avatar size={72} name="Guest" className="mb-4" />
            <Text className="text-xl font-serif font-semibold text-ink mb-2 text-center">
              Welcome to Untold
            </Text>
            <Text className="font-sans text-inkMuted text-sm text-center leading-6 mb-6">
              Sign in to view your profile, manage your posts, and connect safely with others.
            </Text>

            <Button
              variant="secondary"
              title="Continue with Google"
              onPress={() => router.push('/(auth)/login')}
              className="w-full py-3 bg-card border border-border shadow-xs"
              icon={
                <Image 
                  source={require('../../../assets/images/google-logo.png')} 
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
              }
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Logged-in state: Display user info and their posts
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
          <Avatar size={64} name={user.name} imageUri={user.avatarUrl} />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-serif font-semibold text-ink">
              {user.name}
            </Text>
            <Text className="font-sans text-inkMuted text-sm mt-0.5">
              {user.email}
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
                authorName={post.isAnonymous ? 'Anonymous' : user.name} 
                authorImage={post.isAnonymous ? undefined : user.avatarUrl} 
                onLike={() => toggleLike(post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
