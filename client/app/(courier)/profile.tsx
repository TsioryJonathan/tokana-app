import React, { useEffect, useMemo, useState, useCallback } from "react";
import LogoutButton from "../../components/Auth/LogoutButton";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Truck, Package, TrendingUp, Award, Clock, CheckCircle } from "lucide-react-native";
import { getApiClient } from "../../lib/api/client";
import { useToast } from "../../components/ui/Toast";
import { HeaderBackground } from "../../components/CreateOrder/RecapBackground";
import { mapBackendOrderToUI } from "../../lib/mappers/order";

export default function Profile() {
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [avatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    todayDeliveries: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeOrders: 0,
  });

  const loadProfile = useCallback(async () => {
    try {
      const me = await api.me.getApiMe();
      setName(me.name || "");
      setPhone(me.phone || "");
      setEmail(me.email || "");
      setRole(me.role || null);
    } catch (e) {
      console.warn("/api/me failed", e);
      showToast("Impossible de charger le profil", "error");
    }
  }, [api, showToast]);

  const loadStats = useCallback(async () => {
    try {
      const orders = await api.orders.getApiOrders("me", undefined);
      const mapped = (orders || []).map(mapBackendOrderToUI);
      
      const completed = mapped.filter(o => o.status === 'DELIVERED');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCompleted = completed.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today;
      });
      const active = mapped.filter(o => o.status === 'CREATED' || o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT');
      const totalRevenue = completed.reduce((sum, o) => sum + (o.priceAr || 0), 0);
      
      setStats({
        totalDeliveries: completed.length,
        todayDeliveries: todayCompleted.length,
        totalRevenue,
        averageRating: 0, // TODO: calculer depuis les avis
        activeOrders: active.length,
      });
    } catch (e) {
      console.warn("Failed to load stats", e);
    }
  }, [api]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Promise.all([loadProfile(), loadStats()]);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadProfile, loadStats]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#059669" size="large" />
        <Text className="mt-3 text-slate-600 font-quicksand-medium">Chargement du profil…</Text>
      </View>
    );
  }

  function formatAr(n: number) {
    return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header avec illustration */}
      <View className="relative" style={{ paddingTop: insets.top }}>
        <HeaderBackground 
          source={require("../../assets/images/tracking-bg.png")} 
          height={220} 
          opacity={0.7} 
        />
        <View className="absolute inset-0 justify-end px-6 pb-6" style={{ paddingTop: insets.top + 20 }}>
          <Text className="text-3xl font-quicksand-bold text-white mb-1">
            Mon profil
          </Text>
          <Text className="text-white/90 text-sm font-quicksand-medium">
            Livreur
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, marginTop: -80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View className="self-center w-24 h-24 rounded-full bg-white items-center justify-center border-4 border-white shadow-lg mb-4">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 9999 }} />
          ) : (
            <View className="bg-emerald-100 rounded-full p-4">
              <Truck size={32} color="#059669" />
            </View>
          )}
        </View>

        {/* Informations utilisateur */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <Text className="text-lg font-quicksand-bold text-slate-900 text-center mb-1">
            {name || "Livreur"}
          </Text>
          <Text className="text-sm text-slate-500 text-center mb-4">
            {phone || "—"} {email ? `· ${email}` : ""}
          </Text>
          <View className="h-px bg-slate-100 mb-4" />
          <View className="flex-row items-center justify-center">
            <View className="bg-emerald-50 rounded-full px-3 py-1.5">
              <Text className="text-xs font-quicksand-bold text-emerald-700">
                {role?.toUpperCase() || "LIVREUR"}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistiques de performance */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <Text className="text-base font-quicksand-bold text-slate-900 mb-4">
            Statistiques
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <StatItem
              icon={<Package size={20} color="#8B5CF6" />}
              label="Total livré"
              value={stats.totalDeliveries.toString()}
              color="#8B5CF6"
            />
            <StatItem
              icon={<CheckCircle size={20} color="#10B981" />}
              label="Aujourd'hui"
              value={stats.todayDeliveries.toString()}
              color="#10B981"
            />
            <StatItem
              icon={<Clock size={20} color="#3B82F6" />}
              label="En cours"
              value={stats.activeOrders.toString()}
              color="#3B82F6"
            />
            <StatItem
              icon={<TrendingUp size={20} color="#F59E0B" />}
              label="Revenus"
              value={formatAr(stats.totalRevenue)}
              color="#F59E0B"
              small
            />
          </View>
        </View>

        {/* Actions rapides */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <Text className="text-base font-quicksand-bold text-slate-900 mb-3">
            Actions
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(courier)/evening-settlement' as any)}
            className="flex-row items-center justify-between py-3 border-b border-slate-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-emerald-50 rounded-lg p-2 mr-3">
                <Ionicons name="wallet-outline" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-sm font-quicksand-semibold text-slate-900">
                  Règlement du soir
                </Text>
                <Text className="text-xs text-slate-500 font-quicksand-medium">
                  Bilan quotidien & versement
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(courier)/dispatches' as any)}
            className="flex-row items-center justify-between py-3 border-b border-slate-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-sky-50 rounded-lg p-2 mr-3">
                <Ionicons name="people-outline" size={20} color="#0EA5E9" />
              </View>
              <View>
                <Text className="text-sm font-quicksand-semibold text-slate-900">
                  Versements clients J+1
                </Text>
                <Text className="text-xs text-slate-500 font-quicksand-medium">
                  Règlements à effectuer
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(courier)/history' as any)}
            className="flex-row items-center justify-between py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-purple-50 rounded-lg p-2 mr-3">
                <Ionicons name="time-outline" size={20} color="#A855F7" />
              </View>
              <View>
                <Text className="text-sm font-quicksand-semibold text-slate-900">
                  Historique
                </Text>
                <Text className="text-xs text-slate-500 font-quicksand-medium">
                  Toutes mes livraisons
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Informations de contact */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <Text className="text-base font-quicksand-bold text-slate-900 mb-3">
            Informations
          </Text>
          <InfoRow icon="person-outline" label="Nom" value={name || "—"} />
          <View className="h-px bg-slate-100 my-2" />
          <InfoRow icon="call-outline" label="Téléphone" value={phone || "—"} />
          <View className="h-px bg-slate-100 my-2" />
          <InfoRow icon="mail-outline" label="Email" value={email || "—"} />
        </View>

        {/* Logout button */}
        <View className="mt-4">
          <LogoutButton
            title="Se déconnecter"
            confirm
            onLoggedOut={() => {
              router.replace("/(auth)/login" as any);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Composant d'item de statistique
function StatItem({ 
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
    <View className="w-[48%] mb-3">
      <View className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <View className="mb-2" style={{ backgroundColor: `${color}15`, padding: 6, borderRadius: 8, alignSelf: 'flex-start' }}>
          {icon}
        </View>
        <Text className={`font-quicksand-bold text-slate-900 ${small ? 'text-sm' : 'text-lg'}`} numberOfLines={1}>
          {value}
        </Text>
        <Text className="text-xs text-slate-500 font-quicksand-medium mt-1" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// Composant de ligne d'information
function InfoRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: string; 
  label: string; 
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View className="bg-slate-50 rounded-lg p-2 mr-3">
        <Ionicons name={icon as any} size={18} color="#64748B" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-slate-500 font-quicksand-medium mb-0.5">
          {label}
        </Text>
        <Text className="text-sm font-quicksand-semibold text-slate-900">
          {value}
        </Text>
      </View>
    </View>
  );
}

