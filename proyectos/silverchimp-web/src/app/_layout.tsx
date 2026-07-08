import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEventStore } from '@/domain/event-store';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const rehydrate = useEventStore((s) => s.rehydrateFromStorage);

  useEffect(() => {
    async function run() {
      await rehydrate();
      await SplashScreen.hideAsync();
    }
    run();
  }, [rehydrate]);

  const palette = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { fontSize: 18, fontWeight: '800' },
          headerBackTitle: 'Atrás',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Evento' }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Categoría' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
