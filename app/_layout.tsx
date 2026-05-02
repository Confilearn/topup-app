import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineModal } from "@/components/OfflineModal";
import { useThemeStore } from "@/store/themeStore";
import { useNetInfoStore } from "@/store/netInfoStore";
import { queryClient } from "@/lib/query-client";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useThemeStore();
  const initializeNetInfo = useNetInfoStore((state) => state.initializeNetInfo);

  useEffect(() => {
    // Initialize NetInfo listener
    const unsubscribe = initializeNetInfo();

    // Cleanup on unmount
    return unsubscribe;
  }, [initializeNetInfo]);

  return (
    <>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={isDark ? "#080818" : "#ffffff"}
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction" />
      </Stack>
      <OfflineModal />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <RootLayoutNav />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
