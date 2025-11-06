import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { statusLabel, mapBackendStatus } from "@/lib/mappers/order";
import Row from "@/components/CreateOrder/Row";
import { HeaderBackground } from "@/components/CreateOrder/RecapBackground";
import { formatAr } from "@/utils/price.helper";
import { useToast } from "@/components/ui/Toast";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useIsFocused } from "@react-navigation/native";
export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();
  const isFocused = useIsFocused();
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.orders.getApiOrders1(Number(id));
      setOrder(data);
      const h = await api.orders.getApiOrdersHistory(Number(id));
      setHistory(Array.isArray(h) ? h : []);
    } catch (err: any) {
      console.warn("tracking load error", err);
      showToast("Erreur de chargement du suivi", "error");
    } finally {
      setLoading(false);
    }
  }, [api, id, showToast]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [id, load]);

  // Auto-refresh every 2 minutes when focused
  useAutoRefresh(load, 2 * 60 * 1000, isFocused);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Chargement…</Text>
      </View>
    );
  }

  const handleBack = () => {
    router.replace('/(client)/orders' as any);
  };

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg font-bold text-slate-900">
          Suivi indisponible
        </Text>
        <TouchableOpacity 
          onPress={handleBack} 
          className="mt-4 bg-gray-100 rounded-full px-6 py-3 flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
          <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header avec bouton retour */}
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity 
          onPress={handleBack} 
          activeOpacity={0.7}
          className="flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-lg font-quicksand-bold text-slate-900">
            Suivi de commande
          </Text>
        </View>
      </View>

    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} tintColor="#059669" />
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <HeaderBackground source={require("@/assets/images/tracking-bg.png")} height={350} opacity={0.70} />

      {/* Top illustrative map header */}
      {/* <View className="w-full h-[220px] bg-slate-200 relative overflow-hidden">
      </View> */}

      <View className="px-4 pt-4 mt-40">
        {/* Status */}
        <Text className="text-2xl font-quicksand-bold text-slate-800">
          {statusLabel[mapBackendStatus(String(order.status || ""))] || String(order.status)}
        </Text>
      </View>

      {/* Sender information */}
      <View className="px-4 mt-3">
        <Text className="text-[12px] text-slate-800 mb-2">Informations expéditeur</Text>
        <View className="bg-white rounded-2xl border border-slate-200 p-4">
          <Row label="Nom" value={order.pickupName || '—'} />
          <Row label="Téléphone" value={order.pickupPhone || '—'} />
          <Row label="Adresse" value={order.pickupAddress || '—'} />
        </View>
      </View>

      {/* Recipient information */}
      <View className="px-4 mt-4">
        <Text className="text-[12px] text-slate-800 mb-2">Informations destinataire</Text>
        <View className="bg-white rounded-2xl border border-slate-200 p-4">
          <Row label="Nom" value={order.dropoffName || '—'} />
          <Row label="Téléphone" value={order.recipientPhone || '—'} />
          <Row label="Adresse" value={order.dropoffAddress || '—'} />
        </View>
      </View>

      {/* Estimated price */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-600">Prix estimé</Text>
          <Text className="text-xl font-quicksand-bold" style={{ color: '#EF4444' }}>{formatAr(order.priceTotal)}</Text>
        </View>
      </View>

      {/* History (keep below) */}
      <View className="m-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <Text className="text-lg font-bold text-slate-900">Historique</Text>
        {history.length === 0 ? (
          <Text className="mt-2 text-slate-500">Aucun événement.</Text>
        ) : (
          history.map((h, idx) => (
            <View
              key={`${h.id}-${idx}`}
              className="flex-row items-start py-2 border-b border-slate-100"
            >
              <View style={{ marginTop: 4, marginRight: 8 }}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#64748B"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">
                  {statusLabel[mapBackendStatus(String(h.toStatus || ""))] || String(h.toStatus)}
                </Text>
                <Text className="text-xs text-slate-500">
                  {new Date(h.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
    </View>
  );
}
