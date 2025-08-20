import React from "react";
import { Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top","bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />
      <Slot />
    </SafeAreaView>
  );
}
