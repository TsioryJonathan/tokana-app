import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
// safe area handled by (client)/_layout
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StatChip from "@/components/ui/StatChip";
import FilterChip from "@/components/ui/FilterChip";

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

const statusBadge: Record<OrderStatus, string> = {
  CREATED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PICKED_UP: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

const ACTIVE = "#059669";

function formatAr(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}
function formatTime(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}
function isActiveStatus(s: OrderStatus) {
  return s === "CREATED" || s === "PICKED_UP" || s === "IN_TRANSIT";
}

// --- Shimmer skeleton ---
function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 overflow-hidden">
      <View className="h-4 w-24 bg-slate-200 rounded-md mb-2" />
      <View className="h-5 w-48 bg-slate-200 rounded-md mb-2" />
      <View className="h-4 w-36 bg-slate-200 rounded-md" />
      <Animated.View
        style={{ transform: [{ translateX }] }}
        className="absolute top-0 left-0 right-0 bottom-0 opacity-30"
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.8)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// --- Progress (étapes) ---
function stepIndex(status: OrderStatus) {
  switch (status) {
    case "CREATED":
      return 0;
    case "PICKED_UP":
      return 1;
    case "IN_TRANSIT":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return -1; // CANCELLED
  }
}
const stepIcons: { name: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { name: "time-outline", label: "Créée" },
  { name: "cube-outline", label: "Retirée" },
  { name: "bicycle-outline", label: "En cours" },
  { name: "checkmark-circle-outline", label: "Livrée" },
];

function ProgressBar({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <View className="mt-3 px-2 py-1 rounded-full border border-rose-300 bg-rose-50 self-start">
        <Text className="text-[11px] text-rose-700 font-quicksand-semibold">
          Annulée
        </Text>
      </View>
    );
  }
  const idx = stepIndex(status);
  const pct = ((idx + 1) / stepIcons.length) * 100;

  return (
    <View className="mt-3">
      <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <View
          style={{ width: `${pct}%` }}
          className="h-2 bg-emerald-500 rounded-full"
        />
      </View>
      <View className="mt-2 flex-row justify-between">
        {stepIcons.map((s, i) => {
          const active = i <= idx;
          return (
            <View key={s.label} className="items-center w-[25%]">
              <Ionicons
                name={s.name}
                size={14}
                color={active ? ACTIVE : "#94A3B8"}
              />
              <Text
                className={`mt-1 text-[10px] ${active ? "text-emerald-700" : "text-slate-500"} font-quicksand-medium`}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// --- Cards ---
function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
    >
      <View className="flex-row justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center">
            <Ionicons name="receipt-outline" size={14} color="#64748B" />
            <Text className="ml-1 text-[11px] text-slate-500 font-quicksand-medium">
              {order.code}
            </Text>
          </View>
          <View className="mt-1 flex-row items-center flex-wrap">
            <Ionicons name="location-outline" size={16} color="#0F172A" />
            <Text className="ml-1 text-base font-quicksand-semibold text-slate-900">
              {order.from} →
            </Text>
            <Text className="ml-1 text-base font-quicksand-semibold text-slate-900">
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
              {formatTime(order.createdAt)}
            </Text>
          </View>
          <ProgressBar status={order.status} />
        </View>

        <View className="items-end">
          <Text className="text-sm font-quicksand-bold text-slate-900">
            {formatAr(order.priceAr)}
          </Text>
          <View
            className={`mt-2 px-2 py-1 rounded-full border ${statusBadge[order.status]}`}
          >
            <Text className="text-[11px] font-quicksand-semibold">
              {statusLabel[order.status]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600"
          >
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={14} color="#fff" />
              <Text className="ml-1 text-white text-[12px] font-quicksand-bold">
                Suivre
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

type Filter = "ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED";

export default function ClientHome() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [filter, setFilter] = useState<Filter>("ACTIVE");

  const load = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450)); // TODO API
    setOrders(mockActiveOrders);
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

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    if (filter === "ACTIVE")
      return orders.filter((o) => isActiveStatus(o.status));
    if (filter === "DELIVERED")
      return orders.filter((o) => o.status === "DELIVERED");
    return orders.filter((o) => o.status === "CANCELLED");
  }, [orders, filter]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center">
            <Ionicons name="person-outline" size={18} color="#0F172A" />
          </View>
          <View className="ml-2">
            <Text className="text-xs text-slate-500 font-quicksand-medium">
              {greeting()}
            </Text>
            <Text className="text-lg font-quicksand-bold text-slate-900">
              Bienvenue
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/orders" as any)}
          activeOpacity={0.8}
        >
          <View>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
            {/* badge */}
            <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA principal */}
      <View className="px-5">
        <TouchableOpacity
          onPress={() => router.push("/orders/new" as any)}
          activeOpacity={0.9}
          className="rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
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
          label="Aujourd'hui"
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

      {/* Filtres */}
      <View className="px-5 mt-4 flex-row items-center">
        <FilterChip
          label="En cours"
          active={filter === "ACTIVE"}
          onPress={() => setFilter("ACTIVE")}
        />
        <FilterChip
          label="Livrées"
          active={filter === "DELIVERED"}
          onPress={() => setFilter("DELIVERED")}
        />
        <FilterChip
          label="Annulées"
          active={filter === "CANCELLED"}
          onPress={() => setFilter("CANCELLED")}
        />
        <FilterChip
          label="Toutes"
          active={filter === "ALL"}
          onPress={() => setFilter("ALL")}
        />
      </View>

      {/* Liste */}
      <View className="flex-1 mt-3">
        <View className="px-5 mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="bicycle-outline" size={16} color="#0F172A" />
            <Text className="ml-2 text-base font-quicksand-bold text-slate-900">
              En cours
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/orders" as any)}
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

        {loading ? (
          <View className="px-5">
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[ACTIVE]}
                tintColor={ACTIVE}
              />
            }
            ListEmptyComponent={
              <View className="px-5 py-12 items-center">
                <Ionicons name="cube-outline" size={42} color="#94A3B8" />
                <Text className="mt-2 text-slate-600 font-quicksand-medium text-center">
                  Aucune commande ici
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/orders/new" as any)}
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
            }
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onPress={() =>
                  router.push({
                    pathname: "/orders/[id]" as any,
                    params: { id: item.code },
                  })
                }
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
