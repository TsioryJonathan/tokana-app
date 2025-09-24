import React from "react";
import { Stack } from "expo-router";

import { useFonts } from "expo-font";

export default function AuthLayout() {
  const [loaded] = useFonts({
    quicksand: require("../../assets/fonts/QuicksandRegular.ttf"),
  });

  if (!loaded) return null;
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackVisible: true,
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "900",
          fontFamily: "quicksand",
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Connexion" }} />
      <Stack.Screen name="register" options={{ title: "Inscription" }} />
    </Stack>
  );
}
