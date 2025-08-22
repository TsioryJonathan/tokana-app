import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl, ScrollView } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import type { Order } from '@/lib/api/models/Order';
import { mapBackendStatus, statusLabel, type OrderStatus } from '@/lib/mappers/order';

export default function AdminOrdersPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assignInputs, setAssignInputs] = useState<Record<number, string>>({});
  const [assignBusy, setAssignBusy] = useState<Record<number, boolean>>({});
  const [statusBusy, setStatusBusy] = useState<Record<number, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      // Admin sees all orders; API has no explicit all flag, so omit mine and assignedTo
      const list = await api.orders.getApiOrders();
      setOrders(list);
    } catch (e: any) {
      console.warn('orders load error', e?.body || e?.message || e);
      showToast('Chargement des commandes échoué', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---- Admin status update ----
  const backendStatusByUi: Record<OrderStatus, string> = {
    CREATED: 'en_cours_de_traitement',
    PICKED_UP: 'en_route_vers_recuperation',
    IN_TRANSIT: 'en_chemin',
    DELIVERED: 'expedie',
    CANCELLED: 'annule',
  };

  const updateStatus = async (orderId: number, uiStatus: OrderStatus) => {
    setStatusBusy((m) => ({ ...m, [orderId]: true }));
    try {
      await api.orders.patchApiOrdersStatus(orderId, { status: backendStatusByUi[uiStatus] });
      showToast(`Statut mis à jour: ${statusLabel[uiStatus]}`, 'success');
      await load();
    } catch (e: any) {
      console.warn('status update error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || "Mise à jour du statut échouée";
      showToast(msg, 'error');
    } finally {
      setStatusBusy((m) => ({ ...m, [orderId]: false }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const setBusy = (id: number, busy: boolean) => setAssignBusy((m) => ({ ...m, [id]: busy }));
  const setInput = (id: number, v: string) => setAssignInputs((m) => ({ ...m, [id]: v }));

  const assign = async (orderId: number) => {
    const value = assignInputs[orderId]?.trim();
    const toId = value ? Number(value) : NaN;
    if (!value || Number.isNaN(toId)) {
      showToast('ID livreur invalide', 'error');
      return;
    }
    setBusy(orderId, true);
    try {
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: toId });
      showToast('Commande assignée', 'success');
      await load();
    } catch (e: any) {
      console.warn('assign error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Assignation échouée';
      showToast(msg, 'error');
    } finally {
      setBusy(orderId, false);
    }
  };

  const unassign = async (orderId: number) => {
    setBusy(orderId, true);
    try {
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: null });
      showToast('Assignation retirée', 'success');
      await load();
    } catch (e: any) {
      console.warn('unassign error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Désassignation échouée';
      showToast(msg, 'error');
    } finally {
      setBusy(orderId, false);
    }
  };

  const renderItem = ({ item }: { item: Order }) => {
    const busy = !!assignBusy[item.id!];
    const val = assignInputs[item.id!] ?? (item.assignedTo ? String(item.assignedTo) : '');
    return (
      <View
        className="border border-slate-200 rounded-xl p-4 mb-3 bg-white"
        style={{
          elevation: 1,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text className="font-quicksand-bold text-slate-800">#{item.id} · {item.type?.toUpperCase()} · {statusLabel[mapBackendStatus(String(item.status))]}</Text>
        <Text className="text-slate-600 mt-1">{item.pickupAddress} → {item.dropoffAddress}</Text>
        <Text className="text-slate-600 mt-1">Poids: {item.weight}kg · Colis: {item.parcels}</Text>
        <Text className="text-slate-600 mt-1">Assigné à: {item.assignedTo ?? '—'}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            placeholder="ID livreur"
            keyboardType="number-pad"
            value={val}
            onChangeText={(t) => setInput(item.id!, t)}
          />
          <TouchableOpacity
            className={`px-3 py-2 rounded-lg ${busy ? 'bg-emerald-400' : 'bg-emerald-600'}`}
            disabled={busy}
            onPress={() => assign(item.id!)}
          >
            <Text className="text-white">{busy ? '...' : 'Assigner'}</Text>
          </TouchableOpacity>
          {item.assignedTo != null && (
            <TouchableOpacity
              className={`px-3 py-2 rounded-lg ${busy ? 'bg-slate-300' : 'bg-slate-500'}`}
              disabled={busy}
              onPress={() => unassign(item.id!)}
            >
              <Text className="text-white">Retirer</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Status actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
          {(['CREATED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED'] as OrderStatus[]).map((ui) => {
            const busyS = !!statusBusy[item.id!];
            return (
              <TouchableOpacity
                key={ui}
                className={`px-3 py-2 rounded-full border ${busyS ? 'bg-slate-200 border-slate-300' : 'bg-slate-100 border-slate-300'}`}
                disabled={busyS}
                onPress={() => updateStatus(item.id!, ui)}
              >
                <Text className="text-slate-700 text-xs font-quicksand-bold">{statusLabel[ui]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <Text className="text-xl font-quicksand-bold text-slate-900">Commandes</Text>
        <Text className="text-slate-500 mt-1">Assignation des commandes aux livreurs</Text>
      </View>
      <FlatList
        className="px-4 pt-3"
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? (
          <View className="p-10 items-center">
            <Text className="text-slate-500">Aucune commande</Text>
          </View>
        ) : null}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
