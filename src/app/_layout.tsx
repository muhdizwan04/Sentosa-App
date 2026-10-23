import {
  Urbanist_300Light,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  useFonts,
} from '@expo-google-fonts/urbanist';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { StoreProvider } from '@/data/store';
import { useTheme } from '@/theme/theme';

export default function RootLayout() {
  const t = useTheme();
  const [loaded] = useFonts({ Urbanist_300Light, Urbanist_400Regular, Urbanist_500Medium, Urbanist_600SemiBold });
  const navTheme = t.scheme === 'dark' ? DarkTheme : DefaultTheme;

  if (!loaded) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  return (
    <ThemeProvider value={{ ...navTheme, colors: { ...navTheme.colors, background: t.bg } }}>
      <StoreProvider>
        <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="incident/[id]" />
          <Stack.Screen name="water" />
          <Stack.Screen name="book" />
          <Stack.Screen name="job" />
          <Stack.Screen name="demo" options={{ presentation: 'modal' }} />
          <Stack.Screen name="visitor" />
          <Stack.Screen name="guard" />
          <Stack.Screen name="tech" />
          <Stack.Screen name="confirm" />
          <Stack.Screen name="report" />
          <Stack.Screen name="renovation" />
          <Stack.Screen name="renovate/snap" />
          <Stack.Screen name="renovate/design" />
          <Stack.Screen name="renovate/see" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
          <Stack.Screen name="renovate/pros" />
          <Stack.Screen name="renovate/project" />
          <Stack.Screen name="care-setup" />
          <Stack.Screen name="alerts" />
          <Stack.Screen name="estate-alert" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="call" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="care-alert" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="gate-ask" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="respond/[key]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
      </StoreProvider>
    </ThemeProvider>
  );
}
