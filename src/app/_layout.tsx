import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Confetti } from '@/components/confetti';
import { Toast } from '@/components/toast';
import { Wrapped } from '@/components/wrapped';
import { AppProvider, useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function App({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isReady, isWrappedOpen } = useApp();
  const { c, isDark } = useTheme();
  const canShow = fontsLoaded && isReady;

  useEffect(() => {
    if (canShow) SplashScreen.hideAsync();
  }, [canShow]);

  if (!canShow) return null;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={isWrappedOpen || isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      <Wrapped />
      <Confetti />
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold });
  return (
    <AppProvider>
      <App fontsLoaded={fontsLoaded || !!fontError} />
    </AppProvider>
  );
}
