// app/(client)/_layout.tsx
import React from "react";
import { Platform, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { HomeIcon, BoxIcon, PlusCircle, User2Icon } from "lucide-react-native";

export default function ClientLayout() {
  const insets = useSafeAreaInsets();
  const { checking } = useAuthGuard({ requireAuth: true });

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
        <StatusBar
          barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
          translucent={Platform.OS === 'android'}
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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
      <StatusBar
        barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#059669",
          tabBarInactiveTintColor: "#94a3b8",
          tabBarShowLabel: true,
          tabBarStyle: [
            {
              marginBottom: 5,
              marginHorizontal: 10,
              borderColor: "transparent",
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.95)",
              height: 62,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
            { paddingBottom: Math.max(insets.bottom, 6) },
          ],
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil",
            tabBarLabel: "Accueil",
            tabBarIcon: ({ color, size }) => (
              <HomeIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders/index"
          options={{
            title: "Commandes",
            tabBarLabel: "Commandes",
            tabBarIcon: ({ color, size }) => (
              <BoxIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders/new"
          options={{
            title: "Nouveau",
            tabBarLabel: "Nouveau",
            tabBarIcon: ({ color, size }) => (
              <PlusCircle size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarLabel: "Profil",
            tabBarIcon: ({ color, size }) => (
              <User2Icon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
