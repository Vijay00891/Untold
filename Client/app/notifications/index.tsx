import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Heart, UserCheck, Check } from 'lucide-react-native';
import { IconButton } from '../../components/ui/IconButton';
import { useNotificationStore, Notification } from '../../store/useNotificationStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return <MessageCircle size={20} color="#4A90E2" />;
      case 'accept': return <UserCheck size={20} color="#22C55E" />;
      case 'like': return <Heart size={20} color="#FF7F6B" />;
      default: return <MessageCircle size={20} color="#6B7280" />;
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (item.unread) {
      await markAsRead(item.id);
    }
    
    // Navigate based on type
    if (item.type === 'request' || item.type === 'accept' || item.type === 'message') {
      router.push('/(tabs)/chats');
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      className={`flex-row p-4 border-b border-border ${item.unread ? 'bg-card/30' : 'bg-background'}`}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center bg-card border border-border mr-3`}>
        {getIcon(item.type)}
      </View>
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-start mb-1">
          <Text className={`font-sans ${item.unread ? 'font-semibold text-ink' : 'font-medium text-ink/80'}`}>
            {item.title}
          </Text>
          <Text className={`font-sans text-xs ${item.unread ? 'text-accent font-medium' : 'text-inkMuted'}`}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        <Text className={`font-sans text-sm ${item.unread ? 'text-ink font-medium' : 'text-inkMuted'}`}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row items-center justify-between bg-background border-b border-border">
        <View className="flex-row items-center">
          <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
          <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Notifications</Text>
        </View>
        {notifications.length > 0 && (
          <IconButton 
            icon={Check} 
            onPress={markAllAsRead} 
            className="mr-[-8px]"
          />
        )}
      </View>
      
      <FlatList
        style={{ flex: 1 }}
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} colors={['#B3542E']} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20 px-6">
            <Text className="font-serif italic text-inkMuted text-base text-center">
              No notifications yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
