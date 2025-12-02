import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Search, Calendar } from 'lucide-react-native';
import { getApiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';
import { mapBackendOrderToUI, type UIOrder } from '../../lib/mappers/order';

type StatusFilter = 'all' | 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';

export default function CourierHistoryScreen() {
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.orders.getApiOrders('me', undefined);
      setOrders((data || []).map(mapBackendOrderToUI));
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement de l\'historique échoué';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.to?.toLowerCase().includes(q) ||
          o.recipientName?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      CREATED: orders.filter((o) => o.status === 'CREATED').length,
      PICKED_UP: orders.filter((o) => o.status === 'PICKED_UP').length,
      IN_TRANSIT: orders.filter((o) => o.status === 'IN_TRANSIT').length,
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    };
  }, [orders]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Historique</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Toutes mes livraisons</Text>
        </View>
        <TouchableOpacity
          onPress={load}
          className="ml-3 rounded-full bg-emerald-50 p-2"
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <View className="px-4 pt-4">
        <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-white mb-3">
          <Search size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher (ID, adresse, téléphone)"
            className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {(['all', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] as StatusFilter[]).map((status) => {
            const isActive = statusFilter === status;
            const label =
              status === 'all'
                ? 'Toutes'
                : status === 'CREATED'
                ? 'Créées'
                : status === 'PICKED_UP'
                ? 'Récupérées'
                : status === 'IN_TRANSIT'
                ? 'En transit'
                : 'Livrées';
            const count = statusCounts[status];
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                className={`mr-2 px-4 py-2 rounded-full ${
                  isActive ? 'bg-emerald-600' : 'bg-white border border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-quicksand-semibold ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && filteredOrders.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      )}

      {!loading && filteredOrders.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Calendar size={48} color="#94A3B8" />
          <Text className="text-gray-900 font-quicksand-bold text-lg mt-4">Aucune livraison</Text>
          <Text className="text-gray-500 font-quicksand text-sm text-center mt-2">
            Aucune livraison ne correspond à vos critères de recherche.
          </Text>
        </View>
      )}

      {filteredOrders.length > 0 && (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(courier)/orders/[id]' as any,
                  params: { id: item.id },
                })
              }
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 font-quicksand-bold text-sm">
                  Commande #{item.id}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    item.status === 'DELIVERED'
                      ? 'bg-emerald-50'
                      : item.status === 'IN_TRANSIT'
                      ? 'bg-amber-50'
                      : 'bg-sky-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-quicksand-semibold ${
                      item.status === 'DELIVERED'
                        ? 'text-emerald-700'
                        : item.status === 'IN_TRANSIT'
                        ? 'text-amber-700'
                        : 'text-sky-700'
                    }`}
                  >
                    {item.status === 'DELIVERED'
                      ? 'Livrée'
                      : item.status === 'IN_TRANSIT'
                      ? 'En transit'
                      : item.status === 'PICKED_UP'
                      ? 'Récupérée'
                      : 'Créée'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-600 text-xs font-quicksand mb-1">
                {item.to}
              </Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-500 text-xs font-quicksand">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </Text>
                <Text className="text-gray-900 font-clash-bold text-sm">{item.priceAr} Ar</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
