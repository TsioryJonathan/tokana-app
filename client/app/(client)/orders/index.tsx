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
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { HeaderBackground } from "@/components/CreateOrder/RecapBackground";
import { ArrowLeft, ChevronDown, ArrowDown } from "lucide-react-native";
import {
  mapBackendOrderToUI,
  type UIOrder as Order,
  type OrderStatus,
  statusLabel,
  statusBadge,
} from "@/lib/mappers/order";

// Types and mappers centralized in app/lib/mappers/order

// --- Helpers UI ---
const chipStyle: Record<keyof typeof statusLabel | "ALL" | "ACTIVE", string> = {
  ALL: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-indigo-50 text-indigo-700 border-indigo-200",
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

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatYMD(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

// --- Fetch from backend ---
async function fetchOrders(
  api: any,
  q?: string
): Promise<Order[]> {
  const data = await api.orders.getApiOrders(undefined, true);
  let items = data.map(mapBackendOrderToUI);
  if (q?.trim()) {
    const t = q.trim().toLowerCase();
    items = items.filter(
      (o: Order) =>
        o.code.toLowerCase().includes(t) ||
        o.from.toLowerCase().includes(t) ||
        o.to.toLowerCase().includes(t)
    );
  }
  return items;
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
      className="bg-white rounded-2xl border border-slate-100 mb-3"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="rounded-2xl p-4"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-quicksand-bold text-slate-900">{order.code}</Text>
              <View className={`px-2 py-1 rounded-full border ${statusBadge[order.status]}`}>
                <Text className="text-[11px] font-quicksand-semibold">{statusLabel[order.status]}</Text>
              </View>
            </View>
            <Text className="mt-1 text-[12px] text-slate-500">{formatYMD(order.createdAt)}</Text>

            {/* Addresses with connector */}
            <View className="mt-3 flex-row">
              {/* Connector column with modern arrow */}
              <View className="items-center mr-2">
                <View className="w-[1px] h-4 bg-slate-300" />
                <ArrowDown size={14} color="#94A3B8" />
                <View className="w-[1px] h-6 bg-slate-300" />
              </View>
              {/* Addresses column */}
              <View className="flex-1">
                {/* Sender */}
                <View className="flex-row items-start">
                  <Ionicons name="person-outline" size={14} color="#0F172A" style={{ marginTop: 1, marginRight: 6 }} />
                  {/* Name, comma, location icon, address */}
                  <View className="flex-1 flex-row flex-wrap items-start">
                    {!!(order as any).senderName && (
                      <Text className="text-[12px] text-slate-700" numberOfLines={2}>
                        {(order as any).senderName}
                      </Text>
                    )}
                    {!!(order as any).senderName && (
                      <Text className="text-[12px] text-slate-700">, </Text>
                    )}
                    <Ionicons name="location-outline" size={13} color="#475569" style={{ marginTop: 2, marginRight: 4 }} />
                    <Text className="flex-1 text-[12px] text-slate-700" numberOfLines={2}>
                      {order.from}
                    </Text>
                  </View>
                </View>
                {/* Recipient */}
                <View className="mt-4 flex-row items-start">
                  <Ionicons name="person-circle-outline" size={14} color="#0F172A" style={{ marginTop: 1, marginRight: 6 }} />
                  <View className="flex-1 flex-row flex-wrap items-start">
                    {!!(order as any).recipientName && (
                      <Text className="text-[12px] text-slate-700" numberOfLines={2}>
                        {(order as any).recipientName}
                      </Text>
                    )}
                    {!!(order as any).recipientName && (
                      <Text className="text-[12px] text-slate-700">, </Text>
                    )}
                    <Ionicons name="location-outline" size={13} color="#475569" style={{ marginTop: 2, marginRight: 4 }} />
                    <Text className="flex-1 text-[12px] text-slate-700" numberOfLines={2}>
                      {order.to}
                    </Text>
                  </View>
                </View>
              </View>
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
  const params = useLocalSearchParams<{ highlight?: string; filter?: string }>();
  const highlight = params?.highlight || "";
  const initialFilter = (params?.filter as any) || "ALL";
  const { showToast } = useToast();
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    keyof typeof statusLabel | "ALL" | "ACTIVE"
  >(initialFilter);
  const [expressEta, setExpressEta] = useState<{ min: number; max: number } | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);
  const isFocused = useIsFocused();
  // Date display formatted as YYYY.MM.DD
  const todayDisplay = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }, []);

  // API client
  const api = useMemo(getApiClient, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrders(api, q);
      const enriched = res.map(o => {
        if (o.service === 'EXPRESS' && (o.status === 'CREATED' || o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT') && expressEta) {
          return { ...o, etaHint: `ETA ~${expressEta.min}–${expressEta.max} min (indicatif)` } as any;
        }
        return o as any;
      });
      setItems(enriched);
      setLastUpdatedISO(new Date().toISOString());
    } catch (e) {
      console.warn("orders list load error", e);
      showToast("Erreur de chargement des commandes", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [api, q, expressEta, showToast]);

  useEffect(() => {
    if (params?.filter && params.filter !== filter) {
      setFilter(params.filter as any);
    }
  }, [params?.filter]);

  useEffect(() => {
    load();
  }, [q, filter, load]); // reload on search/filter change

  // Trigger load when screen gains focus
  useEffect(() => {
    if (isFocused) load();
  }, [isFocused, load]);

  // Auto-refresh every 2 minutes only when focused
  useAutoRefresh(load, 2 * 60 * 1000, isFocused);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    showToast("Actualisé", "success");
  }, [load]);

  const loadMore = useCallback(async () => {
    // no server pagination yet; noop
  }, []);

  // no page effect

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    if (filter === "ACTIVE")
      return items.filter((o: Order) => isActiveStatus(o.status));
    if (filter === "DELIVERED")
      return items.filter((o: Order) => o.status === "DELIVERED");
    return items.filter((o: Order) => o.status === "CANCELLED");
  }, [items, filter]);

  const renderHeader = (
    <View className="-ml-5">
      {/* Decorative header background matching mock */}
      <HeaderBackground source={require("@/assets/images/orders-bg.png")} height={300} opacity={0.7} gradientHeight={200} />

      {/* Top controls over body content */}
      <View className="pl-8 pt-3 pb-1">
        <View className="flex-row items-end justify-between mb-2 mt-10">
          <View className="flex-col items-start gap-2">
            <TouchableOpacity 
              onPress={() => router.replace('/(client)/home' as any)} 
              hitSlop={8} 
              activeOpacity={0.7}
              className="flex-row items-center gap-2 bg-white/80 rounded-full px-3 py-1.5"
            >
              <ArrowLeft size={18} color="#0F172A" />
              <Text className="text-slate-900 font-quicksand-semibold text-sm">Retour</Text>
            </TouchableOpacity>
            <Text className="text-[16px] font-quicksand-bold text-slate-900">{todayDisplay}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-[12px] text-slate-700 mr-1">Statut</Text>
            <TouchableOpacity
              onPress={() => {
                const order: Array<keyof typeof statusLabel | 'ALL' | 'ACTIVE'> = ['ALL','ACTIVE','DELIVERED','CANCELLED'];
                const idx = order.indexOf(filter);
                const next = order[(idx + 1) % order.length];
                setFilter(next);
              }}
              activeOpacity={0.85}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 flex-row items-center"
            >
              <Text className="text-[12px] font-quicksand-semibold text-emerald-700">{filter === 'ALL' ? 'Tous' : filter === 'ACTIVE' ? 'En cours' : filter === 'DELIVERED' ? 'Livrées' : 'Annulées'}</Text>
              <ChevronDown size={14} color="#059669" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Elements not in mock (search, chips, last-updated) removed intentionally */}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
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
                pathname: "/tracking/[id]" as any,
                params: { id: item.id },
              })
            }
          />
        )}
      />
    </View>
  );
}
