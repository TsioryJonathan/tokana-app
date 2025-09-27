import React from "react";
import { Tabs } from "expo-router";
import { Text, Platform, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import CustomTabBar from "@/components/CustomTabBar";

export default function AdminLayout() {
  const { checking } = useAuthGuard({
    requireAuth: true,
    allowedRoles: ["admin"],
  });

  if (checking) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-white"
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
          translucent={Platform.OS === "android"}
          backgroundColor="transparent"
        />
        <ActivityIndicator color="#059669" size="large" />
        <Text className="text-slate-600 mt-2">Chargement…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      <StatusBar
        barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
        translucent={Platform.OS === "android"}
        backgroundColor="transparent"
      />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} whereToSlice={5} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Accueil" }} />
        <Tabs.Screen name="orders" options={{ title: "Commande" }} />
        <Tabs.Screen name="users" options={{ title: "Utilisateurs" }} />
        <Tabs.Screen name="zones" options={{ title: "Zones" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
