import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore
});

export default function RootLayout() {
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

