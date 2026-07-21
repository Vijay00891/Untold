import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PostEntry } from '../../components/ui/PostEntry';
import { ArrowLeft } from 'lucide-react-native';
import { IconButton } from '../../components/ui/IconButton';

const MOCK_POST = {
  id: '1',
  authorName: 'Sarah J',
  isAnonymous: false,
  content: 'I recently left a job that looked perfect on paper but was destroying my mental health. Best decision I ever made.',
  timestamp: '2 hours ago',
  likeCount: 42,
};

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();

  // In real app, fetch post by ID here

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row items-center bg-background border-b border-border">
        <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
        <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Post</Text>
      </View>
      
      <ScrollView className="flex-1 px-4 pt-4 bg-background">
        <PostEntry 
          {...MOCK_POST} 
          onRelate={() => {
            router.push({
              pathname: '/(tabs)/chats/[conversationId]',
              params: {
                conversationId: `new-${postId}`,
                postId: MOCK_POST.id,
                postContent: MOCK_POST.content,
                authorName: MOCK_POST.authorName || '',
                isAnonymous: MOCK_POST.isAnonymous ? 'true' : 'false',
              }
            });
          }} 
        />
        
        {/* Comments section would go here */}
      </ScrollView>
    </SafeAreaView>
  );
}
