import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Shield, UserX, LogOut, Trash2 } from 'lucide-react-native';
import { IconButton } from '../../components/ui/IconButton';
import { useAuthStore } from '../../store/useAuthStore';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const SettingRow = ({ icon: Icon, title, onPress, destructive = false }: any) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between p-4 bg-background border-b border-border"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Icon size={20} color={destructive ? '#B3542E' : '#6E6659'} strokeWidth={1.5} />
        <Text className={`font-sans font-medium text-base ml-3 ${destructive ? 'text-seal' : 'text-ink'}`}>
          {title}
        </Text>
      </View>
      <ChevronRight size={20} color="#E8E2D6" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row items-center bg-background border-b border-border">
        <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
        <Text style={{ fontFamily: 'Lora', fontSize: 24 }} className="font-semibold text-ink">Settings</Text>
      </View>
      
      <ScrollView className="flex-1 mt-6">
        <View className="border-t border-border mb-6">
          <SettingRow 
            icon={Shield} 
            title="Data & Privacy" 
            onPress={() => router.push('/settings/privacy')} 
          />
          <SettingRow 
            icon={UserX} 
            title="Blocked Users" 
            onPress={() => router.push('/settings/blocked')} 
          />
        </View>

        <View className="border-t border-border">
          <SettingRow 
            icon={LogOut} 
            title="Log Out" 
            onPress={handleLogout} 
          />
          <SettingRow 
            icon={Trash2} 
            title="Delete Account" 
            destructive 
            onPress={() => {}} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
