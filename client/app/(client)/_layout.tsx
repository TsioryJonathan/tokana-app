// app/(client)/_layout.tsx
import React from "react";
import { Platform, StatusBar, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { HomeIcon, BoxIcon, PlusCircle, User2Icon } from "lucide-react-native";
import CustomTabBar from "@/components/CustomTabBar";
import CreateOrderButton from "@/components/CreateOrderButton";

export default function ClientLayout() {
  const insets = useSafeAreaInsets();
  const { checking } = useAuthGuard({ requireAuth: true, requireVerifiedPhone: true });

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
        <StatusBar
          barStyle={Platform.OS === "android" ? "dark-content" : "dark-content"}
          translucent={Platform.OS === "android"}
          backgroundColor="transparent"
        />
        <SafeAreaView className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" size="large" />
          <></>
        </SafeAreaView>
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
      <CreateOrderButton />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} whereToSlice={3} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Accueil" }} />
        <Tabs.Screen name="orders/index" options={{ title: "Commandes" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
        <Tabs.Screen name="orders/new" options={{ title: "Nouveau" }} />
        <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
