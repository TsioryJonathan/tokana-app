import { Stack, useRouter, useSegments } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/components/ui/Toast";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand: require("../assets/fonts/QuicksandRegular.ttf"),
    QuicksandBold: require("../assets/fonts/QuicksandBold.ttf"),
    QuicksandLight: require("../assets/fonts/QuicksandLight.ttf"),
    QuicksandMedium: require("../assets/fonts/QuicksandMedium.ttf"),
    QuicksandSemiBold: require("../assets/fonts/QuicksandSemiBold.ttf"),
  });
  const [authChecked, setAuthChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Minimal guard to avoid flashing protected content before we know auth state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        const root = segments?.[0];
        if (!token) {
          if (root !== "(auth)") router.replace("/(auth)/auth" as any);
        }
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [segments, router]);

  if (!fontsLoaded || !authChecked) {
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
