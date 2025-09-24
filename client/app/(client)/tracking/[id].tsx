import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
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
  const [eta, setEta] = useState<{ min: number; max: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError("Numéro de suivi manquant");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api.orders.getApiOrders1(Number(id));
        const ui = mapBackendOrderToUI(data);
        if (mounted) setOrder(ui);
        if (mounted) setError(null);
        const h = await api.orders.getApiOrdersHistory(Number(id));
        const mapped = (h || [])
          .map((it) => ({
            id: Number(it.id || 0),
            from: it.fromStatus ? mapBackendStatus(it.fromStatus) : null,
            to: mapBackendStatus(String(it.toStatus || "")),
            at: String((it as any).createdAt || ""),
          }))
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
        if (mounted) setHistory(mapped);
        // ETA Express (affichage pour service Express)
        if (ui?.service === 'EXPRESS') {
          try {
            const avail: any = await api.slots.getApiSlotsExpress();
            const min = avail?.eta?.minMinutes;
            const max = avail?.eta?.maxMinutes;
            if (typeof min === 'number' && typeof max === 'number') {
              if (mounted) setEta({ min, max });
            } else if (mounted) {
              setEta({ min: 60, max: 120 });
            }
          } catch {}
        } else if (mounted) {
          setEta(null);
        }
      } catch (e: any) {
        console.warn("tracking load error", e);
        const msg = e?.body?.msg || e?.message || "Suivi introuvable";
        if (mounted) setError(msg);
        showToast("Erreur de chargement du suivi", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api, id, showToast, reloadTick]);

  // Auto-refresh every 2 minutes while on screen
  useAutoRefresh(() => setReloadTick((t) => t + 1), 2 * 60 * 1000, true);
  // Auto-refresh ETA for Express orders every 2 minutes while mounted
  useEffect(() => {
    let timer: any;
    if (order?.service === 'EXPRESS') {
      const refresh = async () => {
        try {
          const avail = await api.slots.getApiSlotsExpress();
          const min = avail?.eta?.minMinutes;
          const max = avail?.eta?.maxMinutes;
          if (typeof min === 'number' && typeof max === 'number') setEta({ min, max });
        } catch {}
      };
      refresh();
      timer = setInterval(refresh, 2 * 60 * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [order?.service, api.slots]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-slate-900 font-quicksand-bold text-lg text-center">Suivi indisponible</Text>
        <Text className="mt-2 text-slate-600 text-center">
          {error || "Aucune commande trouvée pour ce numéro de suivi."}
        </Text>
        <View className="mt-6 flex-row gap-6">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Text className="text-emerald-700 font-quicksand-semibold">Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(client)/orders' as any)} activeOpacity={0.8}>
            <Text className="text-emerald-700 font-quicksand-semibold">Mes commandes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            // relancer le chargement
            setError(null);
            // déclencher l'effet en modifiant un état éphémère
            // ici on peut simplement rappeler la logique via setState
            // mais plus simple: forcer un léger "toggle" de loading
            setLoading(true);
            (async () => {
              try {
                const data = await api.orders.getApiOrders1(Number(id));
                const ui = mapBackendOrderToUI(data);
                setOrder(ui);
                setError(null);
                const h = await api.orders.getApiOrdersHistory(Number(id));
                const mapped = (h || []).map((it) => ({
                  id: Number(it.id || 0),
                  from: it.fromStatus ? mapBackendStatus(it.fromStatus) : null,
                  to: mapBackendStatus(String(it.toStatus || "")),
                  at: String(it.changedAt || ""),
                })).sort((a, b) => (a.at > b.at ? -1 : 1));
                setHistory(mapped);
              } catch (e: any) {
                setError(e?.body?.msg || e?.message || "Suivi introuvable");
              } finally {
                setLoading(false);
              }
            })();
          }} activeOpacity={0.8}>
            <Text className="text-emerald-700 font-quicksand-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity onPress={() => setReloadTick((t) => t + 1)} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm">Statut actuel</Text>
          <Text className="mt-1 text-base font-quicksand-bold text-emerald-600">
            {statusLabel[order.status]}
          </Text>
          {order.service === 'EXPRESS' && eta && (
            <Text className="mt-2 text-[12px] text-emerald-700">
              Livraison estimée {eta.min}–{eta.max} minutes
            </Text>
          )}
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
