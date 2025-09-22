import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {  Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
