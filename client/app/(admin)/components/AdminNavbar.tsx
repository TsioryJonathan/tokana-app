import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Home, Package, Users, MapPin, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/(admin)", label: "Dashboard", icon: <Home size={22} strokeWidth={2.5} /> },
  { path: "/(admin)/orders", label: "Commandes", icon: <Package size={22} strokeWidth={2.5} /> },
  { path: "/(admin)/users", label: "Utilisateurs", icon: <Users size={22} strokeWidth={2.5} /> },
  { path: "/(admin)/zones", label: "Zones", icon: <MapPin size={22} strokeWidth={2.5} /> },
  { path: "/(admin)/profile", label: "Profil", icon: <User size={22} strokeWidth={2.5} /> },
];

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/(admin)") {
      return pathname === "/(admin)" || pathname === "/(admin)/";
    }
    return pathname.startsWith(path);
  };

  const handlePress = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View className="bg-white border-t border-gray-200 shadow-lg">
      <View className="flex-row items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => handlePress(item.path)}
              activeOpacity={0.7}
              className="flex-1 items-center justify-center py-2"
            >
              {active ? (
                <View className="items-center">
                  <View className="bg-emerald-100 rounded-full p-2.5 mb-1">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      color: "#059669",
                    })}
                  </View>
                  <Text className="text-emerald-600 font-quicksand-semibold text-xs mt-0.5">
                    {item.label}
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <View className="p-2.5 mb-1">
                    {React.cloneElement(item.icon as React.ReactElement, {
                      color: "#94A3B8",
                    })}
                  </View>
                  <Text className="text-gray-400 font-quicksand-medium text-xs mt-0.5">
                    {item.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

