// app/(client)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { HomeIcon, BoxIcon, PlusCircle, User2Icon } from "lucide-react-native";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarShowLabel: true,

        tabBarStyle: {
          marginBottom: 5,
          marginHorizontal: 10,
          borderColor: "transparent",
          borderRadius: "10px",
          backgroundColor: "rgba(255,255,255,0.95)",
          height: 62,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
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
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
