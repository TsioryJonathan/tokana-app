// app/(client)/orders/index.tsx
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
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// --- Types ---
type OrderStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";
type ServiceType = "STANDARD" | "EXPRESS";
type Order = {
  id: string; // identifiant interne
  code: string; // code affiché (ex. TK-...)
  createdAt: string; // ISO
  from: string;
  to: string;
  priceAr: number;
  service: ServiceType;
  status: OrderStatus;
};

// --- Helpers UI ---
const statusLabel: Record<OrderStatus, string> = {
  CREATED: "Créée",
  PICKED_UP: "Retirée",
  IN_TRANSIT: "En cours",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};
const chipStyle: Record<keyof typeof statusLabel | "ALL" | "ACTIVE", string> = {
  ALL: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CREATED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PICKED_UP: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};
const statusBadge: Record<OrderStatus, string> = {
  CREATED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PICKED_UP: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};
const ACTIVE_COLOR = "#059669";

function formatAr(n: number) {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}
function isActiveStatus(s: OrderStatus) {
  return s === "CREATED" || s === "PICKED_UP" || s === "IN_TRANSIT";
}

// --- Mock fetch avec pagination ---
function makeMockOrders(page: number, pageSize: number): Order[] {
  const base = (page - 1) * pageSize;
  const statuses: OrderStatus[] = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "DELIVERED",
    "CANCELLED",
  ];
  const areas = [
    "Ankorondrano",
    "Analakely",
    "Ivandry",
    "Isoraka",
    "Ambatonakanga",
    "Andohalo",
  ];
  return Array.from({ length: pageSize }).map((_, i) => {
    const idx = base + i + 1;
    const status = statuses[idx % statuses.length];
    return {
      id: String(idx),
      code: `TK-202508-${String(idx).padStart(3, "0")}`,
      createdAt: new Date(Date.now() - idx * 3_600_000).toISOString(),
      from: areas[idx % areas.length],
      to: areas[(idx + 2) % areas.length],
      priceAr: 3000 + (idx % 5) * 500,
      service: idx % 2 ? "STANDARD" : "EXPRESS",
      status,
    };
  });
}
async function fetchOrders(
  page: number,
  pageSize = 12,
  q?: string
): Promise<{ items: Order[]; hasMore: boolean }> {
  await new Promise((r) => setTimeout(r, 300)); // simulate network
  let items = makeMockOrders(page, pageSize);
  if (q?.trim()) {
    const t = q.trim().toLowerCase();
    items = items.filter(
      (o) =>
        o.code.toLowerCase().includes(t) ||
        o.from.toLowerCase().includes(t) ||
        o.to.toLowerCase().includes(t)
    );
  }
  // Simule 5 pages max
  return { items, hasMore: page < 5 };
}

// --- Composants ---
function FilterChip({
  label,
  active,
  onPress,
  styleKey,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  styleKey: keyof typeof chipStyle;
}) {
  const base = chipStyle[styleKey];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${base} ${active ? "border-emerald-300" : ""}`}
    >
      <Text
        className={`text-[12px] font-quicksand-semibold ${active ? "text-emerald-700" : ""}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OrderRow({
  order,
  onPress,
  highlight,
}: {
  order: Order;
  onPress?: () => void;
  highlight?: boolean;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlight) {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [highlight]);

  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#ECFDF5"], // white -> emerald-50
  });

  return (
    <Animated.View
      style={{ backgroundColor: bg }}
      className="rounded-2xl border border-slate-100 mb-3"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="rounded-2xl p-4"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={14} color="#64748B" />
              <Text className="ml-1 text-[11px] text-slate-500 font-quicksand-medium">
                {order.code}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center flex-wrap">
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
                {new Date(order.createdAt).toLocaleString()}
              </Text>
            </View>
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
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// --- Page ---
export default function OrdersList() {
  const router = useRouter();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "DELIVERED" | "CANCELLED"
  >("ALL");
  const [items, setItems] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      const nextPage = reset ? 1 : page;
      if (reset) {
        setLoading(true);
      }
      const res = await fetchOrders(nextPage, 12, q);
      setHasMore(res.hasMore);
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
      setLoading(false);
    },
    [page, q]
  );

  useEffect(() => {
    load(true);
  }, [q, filter]); // on recharge quand q ou filtre changent (filtre appliqué côté client ci-dessous)

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await load(true);
    setRefreshing(false);
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage((p) => p + 1);
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) load(false);
  }, [page]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    if (filter === "ACTIVE")
      return items.filter((o) => isActiveStatus(o.status));
    if (filter === "DELIVERED")
      return items.filter((o) => o.status === "DELIVERED");
    return items.filter((o) => o.status === "CANCELLED");
  }, [items, filter]);

  const renderHeader = (
    <View className="px-5 pt-4 pb-2 bg-slate-50">
      {/* Barre de recherche */}
      <View className="flex-row items-center bg-white rounded-2xl px-3 py-2 border border-slate-200">
        <Ionicons name="search-outline" size={18} color="#475569" />
        <TextInput
          placeholder="Rechercher (code, lieu...)"
          placeholderTextColor="#94A3B8"
          value={q}
          onChangeText={(t) => {
            setQ(t);
            setPage(1);
          }}
          className="ml-2 flex-1 text-[14px] text-slate-900"
          returnKeyType="search"
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View className="mt-3 flex-row flex-wrap">
        <FilterChip
          label="Toutes"
          styleKey="ALL"
          active={filter === "ALL"}
          onPress={() => {
            setFilter("ALL");
            setPage(1);
          }}
        />
        <FilterChip
          label="En cours"
          styleKey="ACTIVE"
          active={filter === "ACTIVE"}
          onPress={() => {
            setFilter("ACTIVE");
            setPage(1);
          }}
        />
        <FilterChip
          label="Livrées"
          styleKey="DELIVERED"
       
          active={filter === "DELIVERED"}
          onPress={() => {
            setFilter("DELIVERED");
            setPage(1);
          }}
        />
        <FilterChip
          label="Annulées"
          styleKey="CANCELLED"
      
          active={filter === "CANCELLED"}
          onPress={() => {
            setFilter("CANCELLED");
            setPage(1);
          }}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: 28,
        }}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ACTIVE_COLOR]}
            tintColor={ACTIVE_COLOR}
          />
        }
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        ListEmptyComponent={
          !loading ? (
            <View className="px-5 py-16 items-center">
              <Ionicons name="cube-outline" size={40} color="#94A3B8" />
              <Text className="mt-2 text-slate-600 font-quicksand-medium text-center">
                Aucune commande trouvée
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <OrderRow
            order={item}
            highlight={highlight === item.id || highlight === item.code}
            onPress={() =>
              router.push({
                pathname: "/(client)/orders/[id]",
                params: { id: item.code },
              })
            }
          />
        )}
      />
    </View>
  );
}
