import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useToast } from "@/components/ui/Toast";
import {
  mapBackendOrderToUI,
  statusBadge,
  statusLabel,
  type UIOrder,
} from "@/lib/mappers/order";

const ACTIVE_COLOR = "#059669";

function formatAr(n: number) {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export default function CourierTasks() {
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const isFocused = useIsFocused();
  const { showToast } = useToast();
  const [items, setItems] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.orders.getApiOrders("me", undefined);
      setItems((data || []).map(mapBackendOrderToUI));
    } catch (e) {
      console.warn("[courier] list error", e);
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  // Trigger an immediate refresh when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      load();
      // no cleanup required
      return () => {};
    }, [load])
  );

  // Auto-refresh every 2 minutes, only when screen is focused
  useAutoRefresh(load, 2 * 60 * 1000, isFocused);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-3 bg-white border-b border-slate-200">
        <Text className="text-lg font-quicksand-bold text-slate-900">
          Mes courses
        </Text>
        <Text className="text-[12px] text-slate-500">
          Commandes qui me sont assignées {loading ? "· Chargement…" : ""}
        </Text>
      </View>
      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
          <Text className="mt-2 text-slate-600">Chargement…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[ACTIVE_COLOR]}
              tintColor={ACTIVE_COLOR}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="px-5 py-16 items-center">
                <Ionicons name="bicycle-outline" size={40} color="#94A3B8" />
                <Text className="mt-2 text-slate-600 font-quicksand-medium text-center">
                  Aucune course assignée
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(courier)/orders/[id]" as any,
                  params: { id: item.id },
                })
              }
              activeOpacity={0.85}
              className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="receipt-outline"
                      size={14}
                      color="#64748B"
                    />
                    <Text className="ml-1 text-[11px] text-slate-500 font-quicksand-medium">
                      {item.code}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center flex-wrap">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#0F172A"
                    />
                    <Text className="ml-1 text-base text-slate-900 font-quicksand-semibold">
                      {item.from} →
                    </Text>
                    <Text className="ml-1 text-base text-slate-900 font-quicksand-semibold">
                      {item.to}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center">
                    <Ionicons
                      name={
                        item.service === "EXPRESS"
                          ? "flash-outline"
                          : "bicycle-outline"
                      }
                      size={14}
                      color="#475569"
                    />
                    <Text className="ml-1 text-[12px] text-slate-600">
                      {item.service === "EXPRESS" ? "Express" : "Standard"} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-quicksand-bold text-slate-900">
                    {formatAr(item.priceAr)}
                  </Text>
                  <View
                    className={`mt-2 px-2 py-1 rounded-full border ${statusBadge[item.status]}`}
                  >
                    <Text className="text-[11px] font-quicksand-semibold">
                      {statusLabel[item.status]}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
