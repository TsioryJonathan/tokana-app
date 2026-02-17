import { Stack, useRouter, useSegments } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "../components/ui/Toast";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getAccessToken } from "../lib/auth/session";
import { getApiClient } from "../lib/api/client";
import CustomSplashScreen from "../components/CustomSplashScreen";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand: require("../assets/fonts/QuicksandRegular.ttf"),
    QuicksandBold: require("../assets/fonts/QuicksandBold.ttf"),
    QuicksandLight: require("../assets/fonts/QuicksandLight.ttf"),
    QuicksandMedium: require("../assets/fonts/QuicksandMedium.ttf"),
    QuicksandSemiBold: require("../assets/fonts/QuicksandSemiBold.ttf"),
    ClashGrotesk: require("../assets/fonts/QuicksandBold.ttf"),
    ClashGroteskBold: require("../assets/fonts/QuicksandBold.ttf"),
    ClashGroteskLight: require("../assets/fonts/QuicksandLight.ttf"),
    ClashGroteskMedium: require("../assets/fonts/QuicksandMedium.ttf"),
    ClashGroteskSemibold: require("../assets/fonts/QuicksandSemiBold.ttf"),
  });

  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const api = useMemo(getApiClient, []);

  // Initial auth check: redirect based on role
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await api.me.getApiMe();
          if (me.role === "admin") router.replace("/(admin)");
          else if (me.role === "livreur") router.replace("/(courier)");
          else if (me.role === "client") router.replace("/(client)/home");
        } else {
          router.replace("/");
        }
      } catch {
        // Token invalid or network error — send to landing
        router.replace("/");
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: kick unauthenticated users out of protected routes
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      const token = await getAccessToken();
      const root = segments?.[0];
      if (!token && root !== "(auth)") {
        router.replace("/");
      }
    })();
  }, [segments, router, authReady]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!fontsLoaded || showSplash) {
    return (
      <SafeAreaProvider>
        <ToastProvider>
          <CustomSplashScreen />
        </ToastProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(courier)" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
