import React from "react";
import {
  Platform,
  StatusBar,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Tabs } from "expo-router";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import CustomTabBar from "@/components/CustomTabBar";

export default function CourierLayout() {
  const { checking } = useAuthGuard({
    requireAuth: true,
    allowedRoles: ["livreur", "admin"],
  });

  console.log("Courrir");

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
        <StatusBar
          barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
          translucent={Platform.OS === "android"}
          backgroundColor="transparent"
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color="#059669" size="large" />
          <Text style={{ color: "#475569", marginTop: 8 }}>Chargement…</Text>
        </View>
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
        tabBar={(props) => <CustomTabBar {...props} whereToSlice={3} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Accueil" }} />
        <Tabs.Screen name="delivery" options={{ title: "Livraison" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
