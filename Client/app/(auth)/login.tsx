import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/useAuthStore';
import { apiClient } from '../../api/apiClient';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '407453284511-41n9jfcq8hjgqmhag1dl42ddb8mhv2v6.apps.googleusercontent.com',
  });

  const handleGoogleSuccess = async (googleToken?: string) => {
    let name = 'Google User';
    let email = 'user@gmail.com';
    let avatarUrl: string | undefined = undefined;

    // Fetch Google profile metadata if access token is available
    if (googleToken && googleToken.startsWith('ya29.')) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${googleToken}` },
        });
        if (userInfoRes.ok) {
          const info = await userInfoRes.json();
          if (info.name) name = info.name;
          if (info.email) email = info.email;
          if (info.picture) avatarUrl = info.picture;
        }
      } catch (err) {
        console.warn('Could not fetch Google profile info:', err);
      }
    }

    const tokenToSend = googleToken || `dev-${name}`;

    try {
      // Exchange Google token with backend POST /api/auth/google to receive signed JWT access token
      const authRes = await apiClient.post<{
        accessToken: string;
        user: { id: string; displayName: string; avatarUrl?: string };
      }>('/auth/google', {
        idToken: tokenToSend,
      });

      await login(
        {
          id: authRes.user.id,
          name: authRes.user.displayName || name,
          email,
          avatarUrl: authRes.user.avatarUrl || avatarUrl,
        },
        authRes.accessToken
      );
    } catch (err) {
      console.warn('Backend auth exchange warning:', err);
    }

    router.replace('/(tabs)');
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      const idToken = (response as any).params?.id_token;
      handleGoogleSuccess(idToken || accessToken);
    }
  }, [response]);

  return (
    <SafeAreaView 
      style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} 
      className="flex-1 w-full bg-background justify-center items-center p-4"
    >
      <View 
        style={{ width: '100%', maxWidth: 380, alignSelf: 'center' }} 
        className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-sm items-center"
      >
        <View className="mb-8 items-center w-full">
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 88, height: 88, borderRadius: 20 }}
            className="mb-4 shadow-sm"
            resizeMode="cover"
          />
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32 }} className="text-ink mb-2">Untold</Text>
          <Text className="text-inkMuted font-sans text-center text-sm leading-6 px-2">
            Share your experiences safely and connect with those who understand.
          </Text>
        </View>

        <Button
          variant="secondary"
          title="Continue with Google"
          onPress={async () => {
            try {
              if (request) {
                const res = await promptAsync();
                if (res?.type === 'success') {
                  const accessToken = res.authentication?.accessToken;
                  const idToken = (res as any).params?.id_token;
                  await handleGoogleSuccess(idToken || accessToken);
                } else {
                  await handleGoogleSuccess();
                }
              } else {
                await handleGoogleSuccess();
              }
            } catch (e) {
              console.warn('Auth prompt:', e);
              await handleGoogleSuccess();
            }
          }}
          className="w-full mb-4 py-3 rounded-xl bg-card border border-border shadow-xs"
          icon={
            <Image 
              source={require('../../assets/images/google-logo.png')} 
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          }
        />

        <Text className="text-inkMuted font-sans text-xs text-center px-2 leading-5 mt-2">
          Your name and photo stay hidden when posting anonymously.
        </Text>
      </View>
    </SafeAreaView>
  );
}
