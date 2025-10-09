import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useToast } from "@/components/ui/Toast";
import { PricingQuoteRequest } from "@/lib/api/models/PricingQuoteRequest";
import {
  mapBackendOrderToUI,
  type UIOrder as Order,
  type OrderStatus,
  mapBackendStatus,
  statusLabel,
} from "@/lib/mappers/order";

function formatAr(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [rawOrder, setRawOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<
    { id: number; from?: OrderStatus | null; to: OrderStatus; at: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);
  const [svcQuote, setSvcQuote] = useState<{
    total?: number;
    pickup?: number;
    delivery?: number;
    express?: number;
    manual?: boolean;
  } | null>(null);

  const api = useMemo(getApiClient, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setError("Identifiant de commande manquant");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await api.orders.getApiOrders1(Number(id));
        console.log(data);

        const ui = mapBackendOrderToUI(data);
        if (mounted) {
          setOrder(ui);
          setRawOrder(data as any);
          setError(null);
          setLastUpdatedISO(new Date().toISOString());
        }
        // Load history
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
      } catch (e: any) {
        console.warn("order detail error", e);
        const msg = e?.body?.msg || e?.message || "Commande introuvable";
        if (mounted) setError(msg);
        showToast("Erreur de chargement de la commande", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, api, reloadTick]);

  // Trigger reload when screen gains focus
  useEffect(() => {
    if (isFocused) setReloadTick((t) => t + 1);
  }, [isFocused]);

  // Auto-refresh every 2 minutes only when focused
  useAutoRefresh(() => setReloadTick((t) => t + 1), 2 * 60 * 1000, isFocused);

  // Fetch pricing quote for this order to compute service fee and total to collect (COD + service)
  useEffect(() => {
    if (!rawOrder) return;
    let cancelled = false;
    (async () => {
      try {
        const typeEnum = String(rawOrder.type) === 'express' ? PricingQuoteRequest.type.EXPRESS : PricingQuoteRequest.type.STANDARD;
        const body: any = {
          type: typeEnum,
          weight: rawOrder.weight,
          parcels: rawOrder.parcels,
        };
        if (typeof rawOrder.dropoffLat === 'number' && typeof rawOrder.dropoffLng === 'number') {
          body.lat = rawOrder.dropoffLat;
          body.lng = rawOrder.dropoffLng;
        } else if (rawOrder.zoneLevel) {
          body.zoneLevel =
            rawOrder.zoneLevel === 'ville'
              ? PricingQuoteRequest.zoneLevel.VILLE
              : rawOrder.zoneLevel === 'peripherie'
              ? PricingQuoteRequest.zoneLevel.PERIPHERIE
              : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
        }
        const quote = await api.pricing.postApiPricingQuote(body);
        if (cancelled) return;
        setSvcQuote({
          total: quote?.priceTotal ?? undefined,
          pickup: quote?.fees?.pickupFee ?? undefined,
          delivery: quote?.fees?.deliveryFee ?? undefined,
          express: quote?.fees?.expressSurcharge ?? undefined,
          manual: !!quote?.requiresManualHandling,
        });
      } catch (e) {
        if (!cancelled) setSvcQuote(null);
      }
    })();
    return () => { cancelled = true; };
  }, [rawOrder, api]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement de la commande...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-slate-900 font-quicksand-bold text-lg text-center">
          Commande indisponible
        </Text>
        <Text className="mt-2 text-slate-600 text-center">
          {error || "Aucune commande trouvée pour cet identifiant."}
        </Text>
        <View className="mt-6 flex-row gap-6">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Text className="text-emerald-700 font-quicksand-semibold">
              Retour
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setLoading(true);
              (async () => {
                try {
                  const data = await api.orders.getApiOrders1(Number(id));
                  const ui = mapBackendOrderToUI(data);
                  setOrder(ui);
                  setRawOrder(data as any);
                  setError(null);
                  const h = await api.orders.getApiOrdersHistory(Number(id));
                  const mapped = (h || [])
                    .map((it) => ({
                      id: Number(it.id || 0),
                      from: it.fromStatus
                        ? mapBackendStatus(it.fromStatus)
                        : null,
                      to: mapBackendStatus(String(it.toStatus || "")),
                      at: String((it as any).createdAt || ""),
                    }))
                    .sort(
                      (a, b) =>
                        new Date(b.at).getTime() - new Date(a.at).getTime()
                    );
                  setHistory(mapped);
                } catch (e: any) {
                  setError(
                    e?.body?.msg || e?.message || "Commande introuvable"
                  );
                } finally {
                  setLoading(false);
                }
              })();
            }}
            activeOpacity={0.8}
          >
            <Text className="text-emerald-700 font-quicksand-semibold">
              Réessayer
            </Text>
          </TouchableOpacity>
        </View>
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
        {lastUpdatedISO && (
          <Text className="text-[11px] text-slate-400">
            {new Date(lastUpdatedISO).toLocaleTimeString()}
          </Text>
        )}
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

          {/* Détail du prix */}
          <View className="mt-4">
            <Text className="text-slate-500 text-sm">Détail du prix</Text>
            {(() => {
              const p: any = rawOrder || {};
              const amt = (v: any): number | undefined => {
                if (v === undefined || v === null) return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
              };
              const cod = amt(p.cashToCollect) || 0;
              const rows: Array<{ label: string; value?: number }> = [
                { label: 'Montant à encaisser (COD)', value: amt(p.cashToCollect) },
                { label: 'Pickup', value: amt(svcQuote?.pickup) },
                { label: 'Livraison', value: amt(svcQuote?.delivery) },
                { label: 'Express', value: amt(svcQuote?.express) },
              ];
              const present = rows.filter(r => r.value !== undefined);
              const serviceTotal = amt(svcQuote?.total);
              const totalToCollect = (serviceTotal ?? 0) + cod;
              return (
                <View className="mt-1">
                  {present.length === 0 && !serviceTotal ? (
                    <Text className="text-[12px] text-slate-500">Aucun détail disponible</Text>
                  ) : (
                    <>
                      {present.map((r, idx) => (
                        <View key={idx} className="flex-row justify-between py-1">
                          <Text className="text-slate-700">{r.label}</Text>
                          <Text className="text-slate-800">{formatAr(r.value || 0)}</Text>
                        </View>
                      ))}
                      {serviceTotal !== undefined && (
                        <View className="flex-row justify-between py-1 mt-1 border-t border-slate-200">
                          <Text className="text-slate-900 font-quicksand-bold">Frais de service (livraison)</Text>
                          <Text className="text-slate-900 font-quicksand-bold">{formatAr(serviceTotal)}</Text>
                        </View>
                      )}
                      {(serviceTotal !== undefined || cod > 0) && (
                        <View className="flex-row justify-between py-1">
                          <Text className="text-slate-900 font-quicksand-bold">Total à encaisser (COD + service)</Text>
                          <Text className="text-slate-900 font-quicksand-bold">{formatAr(totalToCollect)}</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })()}
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
