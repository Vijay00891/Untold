import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Heart, UserCheck } from 'lucide-react-native';
import { IconButton } from '../../components/ui/IconButton';
import { Avatar } from '../../components/ui/Avatar';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'request', // someone sent a message request
    title: 'New Message Request',
    body: 'Someone related to your post about your mental health.',
    timestamp: '10 min ago',
    unread: true,
  },
  {
    id: '2',
    type: 'accept', // someone accepted your message request
    title: 'Request Accepted',
    body: 'Anonymous accepted your message request. You can now chat.',
    timestamp: '2 hours ago',
    unread: false,
  },
  {
    id: '3',
    type: 'like', // someone liked your post
    title: 'Post Liked',
    body: 'Someone liked your post about navigating adulthood.',
    timestamp: '1 day ago',
    unread: false,
  }
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return <MessageCircle size={20} color="#4A90E2" />;
      case 'accept': return <UserCheck size={20} color="#22C55E" />;
      case 'like': return <Heart size={20} color="#FF7F6B" />;
      default: return <MessageCircle size={20} color="#6B7280" />;
    }
  };

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      className={`flex-row p-4 border-b border-border ${item.unread ? 'bg-background' : 'bg-background'}`}
      activeOpacity={0.7}
      onPress={() => {
        if (item.type === 'request' || item.type === 'accept') {
          router.push('/(tabs)/chats');
        } else {
          router.push('/(tabs)/profile');
        }
      }}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center bg-card border border-border mr-3`}>
        {getIcon(item.type)}
      </View>
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`font-sans font-medium text-base text-ink`}>
            {item.title}
          </Text>
          <Text className={`font-sans text-xs ${item.unread ? 'text-accent font-medium' : 'text-inkMuted'}`}>
            {item.timestamp}
          </Text>
        </View>
        <Text className={`font-sans text-sm ${item.unread ? 'text-ink font-medium' : 'text-inkMuted'}`}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row items-center bg-background border-b border-border">
        <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
        <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Notifications</Text>
      </View>
      
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
