import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Package, 
  ClipboardList, 
  User as UserIcon, 
  Settings as SettingsIcon,
  Plus
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUser } from "@/lib/auth/session";
import { assets } from "@/assets/images/assets";

type User = {
  name?: string;
  email?: string;
  role?: string;
};

type NavCardProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

function NavCard({ icon, label, onPress }: NavCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-1 bg-white rounded-3xl p-6 items-center justify-center shadow-lg shadow-gray-300/50 m-2"
      style={{ minHeight: 140 }}
    >
      <View className="bg-[#FFD700]/10 p-4 rounded-full mb-3">
        {icon}
      </View>
      <Text className="text-gray-900 font-quicksand-semibold text-sm text-center">
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ClientHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const userData = await getUser<User>();
      setUser(userData || null);
    })();
  }, []);

  const userName = user?.name || "User";
  const userRole = user?.role || "Client";

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header with Background Image */}
      <ImageBackground
        source={assets.deliveryGuyMockup}
        className="w-full"
        style={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
        blurRadius={3}
      >
        {/* Dark overlay */}
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/40" />

        {/* Content */}
        <View className="px-6 relative z-10">
          {/* Welcome Text */}
          <Text className="text-white text-5xl font-clash font-bold mb-6">
            Welcome back!
          </Text>

          {/* User Info */}
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border-2 border-white/30 overflow-hidden">
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="ml-4">
              <Text className="text-white text-2xl font-quicksand-bold">
                {userName}
              </Text>
              <Text className="text-white/80 text-base font-quicksand-medium">
                {userRole}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Main Content */}
      <View className="flex-1 px-6 pt-6" style={{ paddingBottom: insets.bottom + 20 }}>
        {/* Create Delivery Button */}
        <TouchableOpacity
          onPress={() => router.push("/orders/new" as any)}
          activeOpacity={0.8}
          className="w-full rounded-3xl overflow-hidden shadow-xl shadow-[#FFD700]/40 mb-8"
        >
          <LinearGradient
            colors={["#FFD700", "#FFA500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-5 items-center flex-row justify-center px-6"
          >
            <View className="bg-white/20 p-2 rounded-full mr-3">
              <Plus size={24} color="#fff" strokeWidth={3} />
            </View>
            <Text className="text-white font-quicksand-bold text-xl uppercase tracking-wide">
              Create Delivery
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Navigation Cards Grid */}
        <View className="flex-1 bg-white rounded-3xl p-4 shadow-lg shadow-gray-300/50">
          <View className="flex-row">
            <NavCard
              icon={<Package size={32} color="#FFD700" strokeWidth={2.5} />}
              label="In Progress"
              onPress={() => router.push("/orders" as any)}
            />
            <NavCard
              icon={<ClipboardList size={32} color="#FFD700" strokeWidth={2.5} />}
              label="History"
              onPress={() => router.push("/orders" as any)}
            />
          </View>
          <View className="flex-row">
            <NavCard
              icon={<UserIcon size={32} color="#FFD700" strokeWidth={2.5} />}
              label="Personal Profile"
              onPress={() => router.push("/profile" as any)}
            />
            <NavCard
              icon={<SettingsIcon size={32} color="#FFD700" strokeWidth={2.5} />}
              label="Settings"
              onPress={() => router.push("/profile" as any)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
