import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { statusLabel, mapBackendStatus } from "@/lib/mappers/order";
import LottieView from "lottie-react-native";
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

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg font-bold text-slate-900">
          Suivi indisponible
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-emerald-600">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#059669"]} tintColor="#059669" />
      }
    >
      {/* Illustration */}
      <View className="bg-white items-center p-6">
        <LottieView
          source={require("../../../assets/lotties/deliveryRiding.json")}
          autoPlay
          loop={true}
        />
      </View>

      {/* Infos principales */}
      <View className="m-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <Text className="text-lg font-bold text-slate-900">
          Détails livraison
        </Text>

        <View className="mt-3">
          <Text className="text-slate-500 text-sm">Expéditeur</Text>
          <Text className="font-semibold text-slate-800">
            {order.pickupName} - {order.pickupPhone}
          </Text>
          <Text className="text-slate-700">{order.pickupAddress}</Text>
        </View>

        <View className="mt-3">
          <Text className="text-slate-500 text-sm">Destinataire</Text>
          <Text className="font-semibold text-slate-800">
            {order.dropoffName}
          </Text>
          <Text className="text-slate-700">{order.recipientPhone}</Text>
          <Text className="text-slate-700">{order.dropoffAddress}</Text>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-slate-500 text-sm">Prix total</Text>
            <Text className="font-bold text-emerald-600">
              {order.priceTotal} Ar
            </Text>
          </View>
          <View>
            <Text className="text-slate-500 text-sm">Statut</Text>
            <Text className="font-bold text-emerald-700">
              {statusLabel[mapBackendStatus(String(order.status || ""))] || String(order.status)}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-slate-500 text-sm">Créneau prévu</Text>
          <Text className="text-slate-800">
            {new Date(order.slotStart).toLocaleString()} –{" "}
            {new Date(order.slotEnd).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Historique */}
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
              <Ionicons
                name="time-outline"
                size={16}
                color="#64748B"
                className="mt-1 mr-2"
              />
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
  );
}
