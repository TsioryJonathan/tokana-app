import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Truck, Package, Clock, CheckCircle } from "lucide-react-native";
import { getApiClient } from "../../lib/api/client";
import { useAutoRefresh } from "../../lib/hooks/useAutoRefresh";
import { useToast } from "../../components/ui/Toast";
import { HeaderBackground } from "../../components/CreateOrder/RecapBackground";
import {
  mapBackendOrderToUI,
  statusBadge,
  statusLabel,
  type UIOrder,
  type OrderStatus,
} from "../../lib/mappers/order";
import { assets } from "../../assets/images/assets";

const ACTIVE_COLOR = "#059669";

function formatAr(n: number) {
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
}

export default function CourierTasks() {
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [items, setItems] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return null;
    try {
      return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      // Fallback simple HH:MM
      const h = lastUpdated.getHours().toString().padStart(2, '0');
      const m = lastUpdated.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
  }, [lastUpdated]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const active = items.filter(o => o.status === 'CREATED' || o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT');
    const completed = items.filter(o => o.status === 'DELIVERED');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompleted = completed.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today;
    });
    const totalRevenue = completed.reduce((sum, o) => sum + (o.priceAr || 0), 0);
    
    return {
      active: active.length,
      completed: completed.length,
      todayCompleted: todayCompleted.length,
      totalRevenue,
    };
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.orders.getApiOrders("me", undefined);
      setItems((data || []).map(mapBackendOrderToUI));
      setLastUpdated(new Date());
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

  // Composant header pour la FlatList
  const ListHeader = () => (
    <>
      {/* Header avec illustration */}
      <View className="relative" style={{ paddingTop: insets.top + 40, marginBottom: -8 }}>
        <HeaderBackground 
          source={require("../../assets/images/tracking-bg.png")} 
          height={200} 
          opacity={0.7} 
        />
        <View className="absolute inset-0 justify-end px-6 pb-6" style={{ paddingTop: insets.top + 60 }}>
          <Text className="text-3xl font-quicksand-bold text-white mb-1">
            Mes courses
          </Text>
          <Text className="text-white/90 text-sm font-quicksand-medium">
            {loading ? "Chargement…" : `${items.length} commande${items.length > 1 ? 's' : ''} assignée${items.length > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Statistiques */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
          <View className="flex-row justify-between mb-3">
            <StatCard
              icon={<Clock size={20} color="#3B82F6" />}
              label="En cours"
              value={stats.active.toString()}
              color="#3B82F6"
            />
            <StatCard
              icon={<CheckCircle size={20} color="#10B981" />}
              label="Aujourd'hui"
              value={stats.todayCompleted.toString()}
              color="#10B981"
            />
            <StatCard
              icon={<Package size={20} color="#8B5CF6" />}
              label="Total"
              value={stats.completed.toString()}
              color="#8B5CF6"
            />
            <StatCard
              icon={<Truck size={20} color="#F59E0B" />}
              label="Revenus"
              value={formatAr(stats.totalRevenue)}
              color="#F59E0B"
              small
            />
          </View>
          {lastUpdatedText && (
            <View className="pt-3 border-t border-slate-100">
              <Text className="text-xs text-slate-400 text-center">
                Dernière mise à jour: {lastUpdatedText}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" size="large" />
          <Text className="mt-3 text-slate-600 font-quicksand-medium">Chargement des commandes…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
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
              <View className="px-5 py-20 items-center">
                <View className="bg-slate-100 rounded-full p-6 mb-4">
                  <Truck size={48} color="#94A3B8" />
                </View>
                <Text className="text-lg font-quicksand-bold text-slate-900 mb-2">
                  Aucune course assignée
                </Text>
                <Text className="text-slate-500 text-center font-quicksand-medium">
                  Vous n'avez pas encore de commandes assignées.{'\n'}
                  Les nouvelles commandes apparaîtront ici.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() =>
                router.push({
                  pathname: "/(courier)/orders/[id]" as any,
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      )}
    </View>
  );
}

// Composant de carte de statistique
function StatCard({ 
  icon, 
  label, 
  value, 
  color,
  small = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
  small?: boolean;
}) {
  return (
    <View className="flex-1 items-center">
      <View className="mb-2" style={{ backgroundColor: `${color}15`, padding: 8, borderRadius: 12 }}>
        {icon}
      </View>
      <Text className={`font-quicksand-bold text-slate-900 ${small ? 'text-xs' : 'text-base'}`} numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-[10px] text-slate-500 font-quicksand-medium mt-0.5" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Composant de carte de commande améliorée
function OrderCard({ 
  order, 
  onPress 
}: { 
  order: UIOrder; 
  onPress: () => void;
}) {
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'CREATED':
        return 'time-outline';
      case 'PICKED_UP':
        return 'cube-outline';
      case 'IN_TRANSIT':
        return 'bicycle-outline';
      case 'DELIVERED':
        return 'checkmark-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'CREATED':
        return '#F59E0B';
      case 'PICKED_UP':
        return '#3B82F6';
      case 'IN_TRANSIT':
        return '#8B5CF6';
      case 'DELIVERED':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100"
    >
      {/* Header avec code et statut */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="bg-emerald-50 rounded-lg p-2 mr-2">
            <Ionicons name="receipt-outline" size={16} color="#059669" />
          </View>
          <Text className="text-sm font-quicksand-bold text-slate-900">
            {order.code}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${statusBadge[order.status]}`}>
          <Text className="text-[10px] font-quicksand-bold">
            {statusLabel[order.status]}
          </Text>
        </View>
      </View>

      {/* Adresses */}
      <View className="mb-3">
        <View className="flex-row items-start mb-2">
          <View className="bg-blue-50 rounded-full p-1.5 mr-2 mt-0.5">
            <Ionicons name="location" size={12} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-slate-500 font-quicksand-medium mb-0.5">Départ</Text>
            <Text className="text-sm font-quicksand-semibold text-slate-900" numberOfLines={1}>
              {order.from}
            </Text>
          </View>
        </View>
        <View className="flex-row items-start">
          <View className="bg-emerald-50 rounded-full p-1.5 mr-2 mt-0.5">
            <Ionicons name="location" size={12} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-slate-500 font-quicksand-medium mb-0.5">Destination</Text>
            <Text className="text-sm font-quicksand-semibold text-slate-900" numberOfLines={1}>
              {order.to}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer avec infos et prix */}
      <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
        <View className="flex-row items-center">
          <Ionicons
            name={order.service === "EXPRESS" ? "flash" : "bicycle"}
            size={14}
            color={order.service === "EXPRESS" ? "#F59E0B" : "#6B7280"}
          />
          <Text className="ml-1 text-xs text-slate-600 font-quicksand-medium">
            {order.service === "EXPRESS" ? "Express" : "Standard"}
          </Text>
          <View className="w-1 h-1 bg-slate-300 rounded-full mx-2" />
          <Ionicons name={getStatusIcon(order.status)} size={12} color={getStatusColor(order.status)} />
        </View>
        <Text className="text-base font-quicksand-bold text-emerald-600">
          {formatAr(order.priceAr)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
