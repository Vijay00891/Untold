import React from 'react';
import { View, FlatList, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { useRouter } from 'expo-router';

const MOCK_CHATS = [
  {
    id: 'c1',
    isRequest: true,
    authorName: 'Anonymous',
    isAnonymous: true,
    lastMessage: 'I completely relate to what you posted about your job...',
    timestamp: '10 min ago',
    unread: true,
  },
  {
    id: 'c2',
    isRequest: false,
    authorName: 'Michael',
    isAnonymous: false,
    lastMessage: 'Thank you for the advice, it really helped me.',
    timestamp: 'Yesterday',
    unread: false,
  }
];

export default function ChatsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof MOCK_CHATS[0] }) => (
    <TouchableOpacity 
      className={`flex-row items-center py-4 px-4 border-b border-border bg-background`}
      onPress={() => router.push(`/chats/${item.id}`)}
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
              {item.timestamp}
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
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
