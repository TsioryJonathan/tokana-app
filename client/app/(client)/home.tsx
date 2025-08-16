import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  Platform,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// --- Types / mocks ---
type OrderStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";
type Order = {
  id: string;
  code: string;
  createdAt: string; // ISO string
  from: string;
  to: string;
  priceAr: number;
  service: "STANDARD" | "EXPRESS";
  status: OrderStatus;
};

const mockActiveOrders: Order[] = [
  {
    id: "1",
    code: "TK-20250816-001",
    createdAt: new Date().toISOString(),
    from: "Ankorondrano",
    to: "Analakely",
    priceAr: 3500,
    service: "STANDARD",
    status: "IN_TRANSIT",
  },
  {
    id: "2",
    code: "TK-20250815-214",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    from: "Ivandry",
    to: "Isoraka",
    priceAr: 5000,
    service: "EXPRESS",
    status: "PICKED_UP",
  },
];

// --- UI helpers ---
const statusLabel: Record<OrderStatus, string> = {
  CREATED: "Créée",
  PICKED_UP: "Retirée",
  IN_TRANSIT: "En cours",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const statusStyle: Record<OrderStatus, string> = {
  CREATED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PICKED_UP: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatAr(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

// --- Order Card ---
function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center">
            <Ionicons name="receipt-outline" size={14} color="#64748B" />
            <Text className="ml-1 text-[11px] text-slate-500 font-quicksand-medium">
              {order.code}
            </Text>
          </View>

          <View className="mt-1 flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#0F172A" />
            <Text className="ml-1 text-base text-slate-900 font-quicksand-semibold">
              {order.from} →
            </Text>
            <Text className="ml-1 text-base text-slate-900 font-quicksand-semibold">
              {order.to}
            </Text>
          </View>

          <View className="mt-1 flex-row items-center">
            <Ionicons
              name={
                order.service === "EXPRESS"
                  ? "flash-outline"
                  : "bicycle-outline"
              }
              size={14}
              color="#475569"
            />
            <Text className="ml-1 text-[12px] text-slate-600">
              {order.service === "EXPRESS" ? "Express" : "Standard"} ·{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-sm font-quicksand-bold text-slate-900">
            {formatAr(order.priceAr)}
          </Text>
          <View
            className={`mt-2 px-2 py-1 rounded-full border ${statusStyle[order.status]}`}
          >
            <Text className="text-[11px] font-quicksand-semibold">
              {statusLabel[order.status]}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- Stat chip ---
function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl px-4 py-3 mr-3 shadow-sm border border-slate-100">
      <View className="flex-row items-center">
        <View>{icon}</View>
        <Text className="ml-2 text-[12px] text-slate-500 font-quicksand-medium">
          {label}
        </Text>
      </View>
      <Text className="mt-1 text-xl font-quicksand-bold text-slate-900">
        {value}
      </Text>
    </View>
  );
}

export default function ClientHome() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450)); // TODO API
    setActiveOrders(mockActiveOrders);
    setTodayCount(3);
    setMonthRevenue(215000);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "default"}
      />

      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="person-circle-outline" size={26} color="#0F172A" />
          <Text className="ml-2 text-2xl font-quicksand-bold text-slate-900">
            Bienvenue
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(client)/orders")}
          className="flex-row items-center"
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* CTA principal */}
      <View className="px-5">
        <TouchableOpacity
          onPress={() => router.push("/(client)/orders/new")}
          activeOpacity={0.9}
          className="rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]} // emerald-500 -> emerald-600
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text className="ml-8 flex-1 text-center text-white text-base font-quicksand-bold">
                Créer une commande
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="px-5 mt-3 flex-row">
        <StatChip
          icon={<Ionicons name="today-outline" size={18} color="#0F172A" />}
          label="Commandes aujourd'hui"
          value={`${todayCount}`}
        />
        <StatChip
          icon={
            <MaterialCommunityIcons
              name="cash-multiple"
              size={18}
              color="#0F172A"
            />
          }
          label="Revenu (mois)"
          value={formatAr(monthRevenue)}
        />
      </View>

      {/* Section En cours */}
      <View className="flex-1 mt-4">
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="bicycle-outline" size={16} color="#0F172A" />
            <Text className="ml-2 text-base font-quicksand-bold text-slate-900">
              En cours
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(client)/orders/index")}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Text className="text-emerald-700 font-quicksand-semibold">
                Tout voir
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#047857" />
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#059669"]}
              tintColor={"#059669"}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="px-5 py-12 items-center">
                <Ionicons name="cube-outline" size={42} color="#94A3B8" />
                <Text className="mt-2 text-slate-600 font-quicksand-medium text-center">
                  Aucune commande en cours
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(client)/orders/new")}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900"
                  activeOpacity={0.9}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text className="ml-1 text-white font-quicksand-semibold">
                      Commander maintenant
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                router.push({
                  pathname: `/(client)/orders/[id]`,
                  params: { id: item.code },
                })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
