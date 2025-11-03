import React from "react";
import { Tabs } from "expo-router";
import { Text, Platform, StatusBar, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import Navbar from "@/components/ui/Navbar";
import { Home, Package, Users, MapPin, User } from "lucide-react-native";

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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <StatusBar
        barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
        translucent={Platform.OS === "android"}
        backgroundColor="transparent"
      />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: "Accueil" }} />
          <Tabs.Screen name="orders" options={{ title: "Commande" }} />
          <Tabs.Screen name="users" options={{ title: "Utilisateurs" }} />
          <Tabs.Screen name="zones" options={{ title: "Zones" }} />
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
          <Tabs.Screen name="orders/[id]" options={{ href: null }} />
        </Tabs>
        <Navbar
          items={[
            { path: "/(admin)", label: "Accueil", icon: <Home size={24} strokeWidth={2} /> },
            { path: "/(admin)/orders", label: "Commandes", icon: <Package size={24} strokeWidth={2} /> },
            { path: "/(admin)/users", label: "Utilisateurs", icon: <Users size={24} strokeWidth={2} /> },
            { path: "/(admin)/zones", label: "Zones", icon: <MapPin size={24} strokeWidth={2} /> },
            { path: "/(admin)/profile", label: "Profil", icon: <User size={24} strokeWidth={2} /> },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
