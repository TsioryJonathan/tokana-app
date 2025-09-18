import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import {
  mapBackendOrderToUI,
  mapBackendStatus,
  statusLabel,
  type UIOrder,
  type OrderStatus,
} from "@/lib/mappers/order";

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [order, setOrder] = useState<UIOrder | null>(null);
  const [history, setHistory] = useState<
    { id: number; from?: OrderStatus | null; to: OrderStatus; at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.orders.getApiOrders1(Number(id));
        const ui = mapBackendOrderToUI(data);
        if (mounted) setOrder(ui);
        const h = await api.orders.getApiOrdersHistory(Number(id));
        const mapped = (h || [])
          .map((it) => ({
            id: Number(it.id || 0),
            from: it.fromStatus ? mapBackendStatus(it.fromStatus) : null,
            to: mapBackendStatus(String(it.toStatus || "")),
            at: String(it.changedAt || ""),
          }))
          .sort((a, b) => (a.at > b.at ? -1 : 1));
        if (mounted) setHistory(mapped);
      } catch (e) {
        console.warn("tracking load error", e);
        showToast("Erreur de chargement du suivi", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, id, showToast]);

  if (loading || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-quicksand-bold text-slate-900 flex-1">
          Suivi {order.code}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm">Statut actuel</Text>
          <Text className="mt-1 text-base font-quicksand-bold text-emerald-600">
            {statusLabel[order.status]}
          </Text>
        </View>

        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900">
            Historique
          </Text>
          {history.length === 0 ? (
            <Text className="mt-2 text-slate-500 text-sm">
              Aucun historique disponible.
            </Text>
          ) : (
            <View className="mt-2">
              {history.map((h, idx) => (
                <View
                  key={`${h.id}-${idx}`}
                  className="flex-row items-start py-2 border-b border-slate-100"
                >
                  <View className="mt-1 mr-3">
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-slate-800">
                      {statusLabel[h.to]}
                    </Text>
                    <Text className="text-[12px] text-slate-500">
                      {new Date(h.at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
