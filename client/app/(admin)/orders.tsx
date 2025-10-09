import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { type OrderStatus } from '@/lib/mappers/order';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAdminOrders } from './hooks/useAdminOrders';
import { AdminOrderItem } from './components/AdminOrderItem';

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

  // Auto-refresh every 2 minutes when focused
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
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <Text className="text-xl font-quicksand-bold text-slate-900">Commandes</Text>
        <Text className="text-slate-500 mt-1">Assignation des commandes aux livreurs</Text>
        {lastUpdatedISO && (
          <Text className="text-[11px] text-slate-400 mt-1">Dernière mise à jour: {new Date(lastUpdatedISO).toLocaleTimeString()}</Text>
        )}
      </View>
      {/* Tabs: Date filter (All / Today / Week) */}
      <View className="px-4 pt-2">
        <View className="flex-row flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2 items-center">
          <TouchableOpacity
            onPress={() => setDateTab('all')}
            className={`px-3 py-2 rounded-lg ${dateTab === 'all' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher toutes les périodes"
          >
            <View className="flex-row items-center">
              <Text className={`${dateTab === 'all' ? 'text-white' : 'text-slate-700'}`}>Toutes</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${dateTab === 'all' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.date?.all ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDateTab('today')}
            className={`px-3 py-2 rounded-lg ${dateTab === 'today' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes du jour"
          >
            <View className="flex-row items-center">
              <Text className={`${dateTab === 'today' ? 'text-white' : 'text-slate-700'}`}>Aujourd’hui</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${dateTab === 'today' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.date?.today ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDateTab('week')}
            className={`px-3 py-2 rounded-lg ${dateTab === 'week' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes de la semaine (depuis dimanche)"
          >
            <View className="flex-row items-center">
              <Text className={`${dateTab === 'week' ? 'text-white' : 'text-slate-700'}`}>Cette semaine</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${dateTab === 'week' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.date?.week ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Tabs: Assigned / Unassigned */}
      <View className="px-4 pt-3">
        <View className="flex-row bg-white border border-slate-200 rounded-2xl p-2 items-center">
          <TouchableOpacity
            onPress={() => setFilterTab('assigned')}
            className={`px-3 py-2 rounded-lg ${filterTab === 'assigned' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes assignées"
          >
            <View className="flex-row items-center">
              <Text className={`${filterTab === 'assigned' ? 'text-white' : 'text-slate-700'}`}>Assignées</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${filterTab === 'assigned' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.assignedCount ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="w-[8]" />
          <TouchableOpacity
            onPress={() => setFilterTab('unassigned')}
            className={`px-3 py-2 rounded-lg ${filterTab === 'unassigned' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes non assignées"
          >
            <View className="flex-row items-center">
              <Text className={`${filterTab === 'unassigned' ? 'text-white' : 'text-slate-700'}`}>Non assignées</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${filterTab === 'unassigned' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.unassignedCount ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Tabs: Service Type (All / Standard / Express) */}
      <View className="px-4 pt-2">
        <View className="flex-row bg-white border border-slate-200 rounded-2xl p-2 items-center">
          <TouchableOpacity
            onPress={() => setServiceTab('all')}
            className={`px-3 py-2 rounded-lg ${serviceTab === 'all' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher toutes les commandes"
          >
            <View className="flex-row items-center">
              <Text className={`${serviceTab === 'all' ? 'text-white' : 'text-slate-700'}`}>Toutes</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${serviceTab === 'all' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.service?.all ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="w-[8]" />
          <TouchableOpacity
            onPress={() => setServiceTab('standard')}
            className={`px-3 py-2 rounded-lg ${serviceTab === 'standard' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes Standard"
          >
            <View className="flex-row items-center">
              <Text className={`${serviceTab === 'standard' ? 'text-white' : 'text-slate-700'}`}>Standard</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${serviceTab === 'standard' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.service?.standard ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View className="w-[8]" />
          <TouchableOpacity
            onPress={() => setServiceTab('express')}
            className={`px-3 py-2 rounded-lg ${serviceTab === 'express' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher les commandes Express"
          >
            <View className="flex-row items-center">
              <Text className={`${serviceTab === 'express' ? 'text-white' : 'text-slate-700'}`}>Express</Text>
              <View className={`ml-2 px-2 h-5 min-w-[20px] rounded-full items-center justify-center ${serviceTab === 'express' ? 'bg-emerald-700' : 'bg-slate-300'}`}>
                <Text className="text-[11px] text-white">{counts?.service?.express ?? 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        className="px-4 pt-3"
        data={filteredOrders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? (
          <View className="p-10 items-center">
            <Text className="text-slate-500">
              {`Aucune commande ${serviceTab === 'all' ? '' : serviceTab === 'express' ? 'Express ' : 'Standard '} ${filterTab === 'assigned' ? 'assignée' : 'non assignée'} ${dateTab === 'all' ? '' : dateTab === 'today' ? 'aujourd’hui' : 'cette semaine'}`}
            </Text>
          </View>
        ) : null}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
