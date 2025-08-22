import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import {
  mapBackendOrderToUI,
  type UIOrder as Order,
  type OrderStatus,
  mapBackendStatus,
  statusLabel,
} from "@/lib/mappers/order";

// Types et mapping centralisés dans app/lib/mappers/order

// Helpers affichage centralisés dans mappers/order

function formatAr(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<
    { id: number; from?: OrderStatus | null; to: OrderStatus; at: string }[]
  >([]);

  const api = useMemo(getApiClient, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.orders.getApiOrders1(Number(id));
        const ui = mapBackendOrderToUI(data);
        if (mounted) setOrder(ui);
        // Load history
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
        console.warn("order detail error", e);
        showToast("Erreur de chargement de la commande", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, api, showToast]);

  if (loading || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement de la commande...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-quicksand-bold text-slate-900 flex-1">
          Commande {order.code}
        </Text>
      </View>

      {/* Contenu */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm">Statut</Text>
          <Text className="mt-1 text-base font-quicksand-bold text-emerald-600">
            {statusLabel[order.status]}
          </Text>

          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Lieu de départ</Text>
            <Text className="text-base font-quicksand-semibold text-slate-900">
              {order.from}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Lieu de destination</Text>
            <Text className="text-base font-quicksand-semibold text-slate-900">
              {order.to}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Service</Text>
            <Text className="text-base font-quicksand-semibold text-slate-900">
              {order.service === "EXPRESS" ? "Express" : "Standard"}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Prix</Text>
            <Text className="text-base font-quicksand-bold text-slate-900">
              {formatAr(order.priceAr)}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Date de création</Text>
            <Text className="text-base text-slate-900">
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Historique des statuts */}
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
