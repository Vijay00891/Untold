import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { IconButton } from '../../components/ui/IconButton';
import { Card } from '../../components/ui/Card';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 h-14 flex-row items-center bg-navbar border-b border-border">
        <IconButton icon={ArrowLeft} onPress={() => router.back()} className="-ml-2 mr-2" />
        <Text className="text-xl font-inter-bold text-heading">Data & Privacy</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-8">
          <ShieldCheck size={64} color="#22C55E" />
          <Text className="text-2xl font-inter-bold text-heading mt-4 text-center">
            Your Privacy is Our Priority
          </Text>
        </View>

        <Card className="mb-6 border-0 shadow-none">
          <Text className="text-lg font-inter-semibold text-heading mb-2">What we store</Text>
          <Text className="text-body font-inter leading-6">
            We only store the absolute minimum needed for the app to function: your Google display name, email, and avatar. That's it.
          </Text>
        </Card>

        <Card className="mb-6 border-0 shadow-none">
          <Text className="text-lg font-inter-semibold text-heading mb-2">No Tracking</Text>
          <Text className="text-body font-inter leading-6">
            We do not use any third-party analytics, ad SDKs, or fingerprinting libraries. Your activity stays between you and the people you choose to connect with.
          </Text>
        </Card>

        <Card className="mb-6 border-0 shadow-none">
          <Text className="text-lg font-inter-semibold text-heading mb-2">End-to-End Encrypted</Text>
          <Text className="text-body font-inter leading-6">
            Your private conversations are encrypted on your device. We cannot read them, and we will never try to.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
