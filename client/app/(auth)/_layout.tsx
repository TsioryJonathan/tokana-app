import React from "react";
import { Stack } from "expo-router";

import { useFonts } from "expo-font";

export default function AuthLayout() {
  const [loaded] = useFonts({
    quicksand: require("../../assets/fonts/QuicksandRegular.ttf"),
    clash: require("../../assets/fonts/ClashGrotesk-Regular.otf"),
  });

  if (!loaded) {
    return null;
  }
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackVisible: true,
      }}
    >
      <Stack.Screen name="login" options={{ title: "" }} />
      <Stack.Screen name="register" options={{ title: "" }} />
    </Stack>
  );
}
