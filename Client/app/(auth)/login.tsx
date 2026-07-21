import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
    iosClientId: 'YOUR_IOS_CLIENT_ID_HERE',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID_HERE',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        login(
          { id: '1', name: 'Demo User', email: 'user@example.com' },
          authentication.accessToken
        );
        router.replace('/(tabs)');
      }
    }
  }, [response]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-background justify-center items-center p-6">
      <View className="w-full max-w-md">
        <View className="mb-10 items-center">
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 100, height: 100, borderRadius: 22 }}
            className="mb-4 shadow-sm"
            resizeMode="cover"
          />
          <Text style={{ fontFamily: 'Lora', fontSize: 36 }} className="font-semibold text-ink mb-2">Untold</Text>
          <Text className="text-inkMuted font-sans text-center text-base leading-6 px-4">
            Share your experiences safely and connect with those who understand.
          </Text>
        </View>

        <Button
          variant="primary"
          title="Continue with Google"
          disabled={!request}
          onPress={() => promptAsync()}
          className="w-full mb-6 py-4 rounded-xl"
        />

        <Text className="text-inkMuted font-sans text-xs text-center px-4 leading-5 mt-4">
          Your name and photo stay hidden when posting anonymously.
        </Text>
      </View>
    </SafeAreaView>
  );
}
