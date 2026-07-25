import { useFonts as useInter } from '@expo-google-fonts/inter';
import { useFonts as useLora, Lora_400Regular, Lora_600SemiBold, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { useFonts as useJetBrains, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { useAuthStore } from '../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';

if (typeof window !== 'undefined') {
  WebBrowser.maybeCompleteAuthSession();
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const restoreToken = useAuthStore((state) => state.restoreToken);

  const [interLoaded, interError] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [loraLoaded, loraError] = useLora({
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_400Regular_Italic,
  });

  const [jbLoaded, jbError] = useJetBrains({
    JetBrainsMono_400Regular,
  });

  const error = interError || loraError || jbError;
  const loaded = interLoaded && loraLoaded && jbLoaded;

  useEffect(() => {
    // Restore persistent session on app startup
    restoreToken();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF9F5', alignItems: 'center', overflow: 'hidden' }} className="flex-1 bg-background items-center">
      <View style={{ flex: 1, width: '100%', maxWidth: 640, backgroundColor: '#FBF9F5', overflow: 'hidden' }} className="flex-1 w-full max-w-[640px] bg-background">
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FBF9F5' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/privacy" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="post/[postId]" />
        </Stack>
      </View>
    </View>
  );
}
