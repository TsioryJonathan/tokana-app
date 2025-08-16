import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Types de commande
type OrderStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";
type Order = {
  id: string;
  code: string;
  createdAt: string;
  from: string;
  to: string;
  priceAr: number;
  service: "STANDARD" | "EXPRESS";
  status: OrderStatus;
};

// Mock pour simuler une commande (remplace par API)
const mockOrder: Order = {
  id: "1",
  code: "TK-20250816-001",
  createdAt: new Date().toISOString(),
  from: "Ankorondrano",
  to: "Analakely",
  priceAr: 3500,
  service: "STANDARD",
  status: "IN_TRANSIT",
};

// Helpers affichage
const statusLabel: Record<OrderStatus, string> = {
  CREATED: "Créée",
  PICKED_UP: "Retirée",
  IN_TRANSIT: "En cours",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

function formatAr(amount: number) {
  return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Ici tu remplaces par un appel API en fonction de id
    // ex: fetch(`/api/orders/${id}`)
    setOrder(mockOrder);
  }, [id]);

  if (!order) {
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
      </ScrollView>
    </View>
  );
}
