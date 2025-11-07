import React from "react";
import { Tabs } from "expo-router";
import { Text, Platform, StatusBar, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthGuard } from "../../lib/hooks/useAuthGuard";
import AdminNavbar from "./components/AdminNavbar";
import { LinearGradient } from "expo-linear-gradient";

export default function AdminLayout() {
  const { checking } = useAuthGuard({
    requireAuth: true,
    allowedRoles: ["admin"],
  });

  if (checking) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
          translucent={Platform.OS === "android"}
          backgroundColor="transparent"
        />
        <LinearGradient
          colors={["#059669", "#047857", "#065F46"]}
          className="absolute inset-0"
        />
        <ActivityIndicator color="#fff" size="large" />
        <Text className="text-white mt-4 font-quicksand-semibold text-lg">Chargement…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["top"]}>
      <StatusBar
        barStyle={Platform.OS === "android" ? "light-content" : "dark-content"}
        translucent={Platform.OS === "android"}
        backgroundColor="#059669"
      />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="orders" options={{ title: "Commandes" }} />
          <Tabs.Screen name="users" options={{ title: "Utilisateurs" }} />
          <Tabs.Screen name="zones" options={{ title: "Zones" }} />
          <Tabs.Screen name="profile" options={{ title: "Profil" }} />
          <Tabs.Screen name="orders/[id]" options={{ href: null }} />
        </Tabs>
        <AdminNavbar />
      </View>
    </SafeAreaView>
  );
}
