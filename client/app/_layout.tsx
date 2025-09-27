import { Stack, useRouter, useSegments } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/components/ui/Toast";
import React, { useEffect, useMemo, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";
import { getApiClient } from "@/lib/api/client";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand: require("../assets/fonts/QuicksandRegular.ttf"),
    QuicksandBold: require("../assets/fonts/QuicksandBold.ttf"),
    QuicksandLight: require("../assets/fonts/QuicksandLight.ttf"),
    QuicksandMedium: require("../assets/fonts/QuicksandMedium.ttf"),
    QuicksandSemiBold: require("../assets/fonts/QuicksandSemiBold.ttf"),
    ClashGrotesk: require("../assets/fonts/ClashGrotesk-Regular.otf"),
    ClashGroteskBold: require("../assets/fonts/ClashGrotesk-Bold.otf"),
    ClashGroteskLight: require("../assets/fonts/ClashGrotesk-Light.otf"),
    ClashGroteskMedium: require("../assets/fonts/ClashGrotesk-Medium.otf"),
    ClashGroteskSemibold: require("../assets/fonts/ClashGrotesk-Semibold.otf"),
  });

  const [, setAuthChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const api = useMemo(getApiClient, []);

  useEffect(() => {
    const check = async () => {
      try {
        const token = await getAccessToken();

        if (token) {
          const me = await api.me.getApiMe();
          if (me.role === "admin") router.replace("/(admin)");
          else if (me.role === "livreur") {
            router.replace("/(courier)");
          } else if (me.role === "client") {
            router.replace("/(client)/home");
          }
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.warn(error);
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Minimal guard to avoid flashing protected content before we know auth state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        const root = segments?.[0];

        if (!token && root !== "(auth)") {
          router.replace("/");
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [segments, router]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <ToastProvider>
          <View className="flex-1 items-center justify-center bg-customwhite">
            <ActivityIndicator size="large" />
          </View>
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
