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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineModal } from "@/components/OfflineModal";
import { useThemeStore } from "@/store/themeStore";
import { useNetInfoStore } from "@/store/netInfoStore";
import { useColors } from "@/hooks/useTheme";
import { queryClient } from "@/lib/query-client";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useThemeStore();
  const colors = useColors();
  const initializeNetInfo = useNetInfoStore((state) => state.initializeNetInfo);

  useEffect(() => {
    // Initialize NetInfo listener
    const unsubscribe = initializeNetInfo();

    // Cleanup on unmount
    return unsubscribe;
  }, [initializeNetInfo]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? colors.bgPrimary : colors.bgSecondary,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction" />
      </Stack>
      <OfflineModal />
    </SafeAreaView>
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
          <SafeAreaProvider>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
