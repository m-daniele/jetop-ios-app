import 'react-native-url-polyfill/auto';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import '../global.css';
import { useColorScheme } from "hooks/useColorScheme";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StatusBar, Platform, Appearance } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

useEffect(() => {
  // Imposta il tema scuro globalmente
  Appearance.setColorScheme('dark');
  
  // Status bar scura per matchare
  StatusBar.setBarStyle('light-content');
  
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
  }
}, []);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    'RedHatDisplay-Regular': require('assets/fonts/RedHatDisplay-Regular.ttf'), 
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="events" options={{ headerShown: false }} />
          </Stack>
          <StatusBar />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}