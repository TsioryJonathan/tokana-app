import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAutoRefresh } from '../../lib/hooks/useAutoRefresh';
import { type OrderStatus } from '../../lib/mappers/order';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAdminOrders } from './hooks/useAdminOrders';
import { AdminOrderItem } from './components/AdminOrderItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Filter, RefreshCw, Calendar, UserCheck, UserX } from 'lucide-react-native';

export default function AdminOrdersPage() {
  const router = useRouter();
  const {
    orders,
    filteredOrders,
    loading,
    refreshing,
    lastUpdatedISO,
    filterTab,
    setFilterTab,
    serviceTab,
    setServiceTab,
    dateTab,
    setDateTab,
    assignInputs,
    setAssignInput,
    assignBusy,
    statusBusy,
    load,
    onRefresh,
    assign,
    unassign,
    updateStatus,
    updateStatusBackend,
    counts,
  } = useAdminOrders();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) load();
  }, [isFocused]);

  useAutoRefresh(load, 2 * 60 * 1000, isFocused);

  const renderItem = ({ item }: { item: any }) => {
    const busy = !!assignBusy[item.id!];
    const val = assignInputs[item.id!] ?? (item.assignedTo ? String(item.assignedTo) : '');
    return (
      <AdminOrderItem
        order={item}
        assignValue={val}
        onChangeAssignValue={(t) => setAssignInput(item.id!, t)}
        busyAssign={busy}
        busyStatus={!!statusBusy[item.id!]}
        onPressView={() => router.push({ pathname: '/(admin)/orders/[id]' as any, params: { id: String(item.id) } })}
        onAssign={() => assign(item.id!)}
        onUnassign={() => unassign(item.id!)}
        onUpdateStatus={(ui: OrderStatus) => updateStatus(item.id!, ui)}
        onUpdateBackendStatus={(s: string) => updateStatusBackend(item.id!, s)}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-6 px-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-3xl font-clash-bold mb-1">Commandes</Text>
            <Text className="text-emerald-100 text-sm font-quicksand">
              Gestion et assignation des commandes
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-white/20 rounded-full p-2.5"
            activeOpacity={0.7}
          >
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {lastUpdatedISO && (
          <Text className="text-white/70 text-xs font-quicksand">
            Dernière mise à jour: {new Date(lastUpdatedISO).toLocaleTimeString('fr-FR')}
          </Text>
        )}
      </LinearGradient>

      {/* Filtres */}
      <View className="px-6 pt-4 pb-2">
        {/* Filtre Date */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-3">
          <View className="flex-row gap-2">
            {(['all', 'today', 'week'] as const).map((tab) => {
              const isActive = dateTab === tab;
              const labels = { all: 'Toutes', today: "Aujourd'hui", week: 'Cette semaine' };
              const count = counts?.date?.[tab] ?? 0;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setDateTab(tab)}
                  className="flex-1 rounded-xl overflow-hidden"
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient colors={['#059669', '#047857']} className="py-2.5 items-center">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-white font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-white/30 rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View className="py-2.5 items-center bg-gray-50">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-gray-600 font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-gray-300 rounded-full px-2 py-0.5">
                          <Text className="text-gray-700 text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filtre Assignation */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-3">
          <View className="flex-row gap-2">
            {(['assigned', 'unassigned'] as const).map((tab) => {
              const isActive = filterTab === tab;
              const labels = { assigned: 'Assignées', unassigned: 'Non assignées' };
              const count = tab === 'assigned' ? counts?.assignedCount ?? 0 : counts?.unassignedCount ?? 0;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setFilterTab(tab)}
                  className="flex-1 rounded-xl overflow-hidden"
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient colors={['#059669', '#047857']} className="py-2.5 items-center">
                      <View className="flex-row items-center gap-1.5">
                        {tab === 'assigned' ? (
                          <UserCheck size={16} color="#fff" />
                        ) : (
                          <UserX size={16} color="#fff" />
                        )}
                        <Text className="text-white font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-white/30 rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View className="py-2.5 items-center bg-gray-50">
                      <View className="flex-row items-center gap-1.5">
                        {tab === 'assigned' ? (
                          <UserCheck size={16} color="#64748B" />
                        ) : (
                          <UserX size={16} color="#64748B" />
                        )}
                        <Text className="text-gray-600 font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-gray-300 rounded-full px-2 py-0.5">
                          <Text className="text-gray-700 text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filtre Service */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-3">
          <View className="flex-row gap-2">
            {(['all', 'standard', 'express'] as const).map((tab) => {
              const isActive = serviceTab === tab;
              const labels = { all: 'Toutes', standard: 'Standard', express: 'Express' };
              const count = counts?.service?.[tab] ?? 0;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setServiceTab(tab)}
                  className="flex-1 rounded-xl overflow-hidden"
                  activeOpacity={0.7}
                >
                  {isActive ? (
                    <LinearGradient colors={['#059669', '#047857']} className="py-2.5 items-center">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-white font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-white/30 rounded-full px-2 py-0.5">
                          <Text className="text-white text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View className="py-2.5 items-center bg-gray-50">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-gray-600 font-quicksand-semibold text-sm">{labels[tab]}</Text>
                        <View className="bg-gray-300 rounded-full px-2 py-0.5">
                          <Text className="text-gray-700 text-xs font-quicksand-bold">{count}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset filters */}
        <TouchableOpacity
          className="self-end px-4 py-2 bg-gray-100 rounded-full flex-row items-center gap-2"
          onPress={() => { setServiceTab('express'); setDateTab('today'); setFilterTab('unassigned'); }}
          activeOpacity={0.7}
        >
          <Filter size={14} color="#64748B" />
          <Text className="text-gray-700 text-xs font-quicksand-bold">Réinitialiser</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        className="px-6 pt-2"
        data={filteredOrders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        ListEmptyComponent={
          !loading ? (
            <View className="p-10 items-center">
              <Package size={48} color="#94A3B8" />
              <Text className="text-gray-500 mt-4 text-center font-quicksand-medium">
                {`Aucune commande ${serviceTab === 'all' ? '' : serviceTab === 'express' ? 'Express ' : 'Standard '}${filterTab === 'assigned' ? 'assignée' : 'non assignée'} ${dateTab === 'all' ? '' : dateTab === 'today' ? "aujourd'hui" : 'cette semaine'}`}
              </Text>
            </View>
          ) : (
            <View className="p-10 items-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
