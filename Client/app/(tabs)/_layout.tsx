import { Tabs } from 'expo-router';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react-native';

export default function TabLayout() {
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
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} strokeWidth={1.5} />,
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
