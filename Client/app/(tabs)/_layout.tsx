import { Tabs } from 'expo-router';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react-native';
import { View } from 'react-native';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function TabLayout() {
  const notifications = useNotificationStore((state) => state.notifications);
  const hasUnreadChats = notifications.some((n) => n.unread && ['message', 'request', 'accept'].includes(n.type));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5A62', // accent
        tabBarInactiveTintColor: '#6E6659', // inkMuted
        tabBarStyle: {
          backgroundColor: '#FBF9F5', // background paper color
          borderTopColor: '#E8E2D6', // border color
          height: 72,
          paddingBottom: 16,
          paddingTop: 8,
          elevation: 0, // remove shadow on android
          shadowOpacity: 0, // remove shadow on ios/web
        },
        tabBarItemStyle: {
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="post/new"
        options={{
          title: 'New Post',
          tabBarIcon: ({ color }) => <PlusCircle color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="chats/index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <MessageSquare color={color} size={22} strokeWidth={1.5} />
              {hasUnreadChats && (
                <View 
                  style={{
                    position: 'absolute',
                    right: -4,
                    top: -2,
                    width: 10,
                    height: 10,
                    backgroundColor: '#B3542E', // bg-seal / accent color
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: '#FBF9F5', // background color
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={22} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen name="chats/[conversationId]" options={{ href: null }} />
    </Tabs>
  );
}
