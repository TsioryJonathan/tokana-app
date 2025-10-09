import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import type { Order } from '@/lib/api/models/Order';
import { mapBackendStatus, statusLabel, type OrderStatus } from '@/lib/mappers/order';
import { useCourierSearch } from '../hooks/useCourierSearch';

export type AdminOrderItemProps = {
  order: Order;
  assignValue: string;
  onChangeAssignValue: (text: string) => void;
  busyAssign: boolean;
  busyStatus: boolean;
  onPressView: () => void;
  onAssign: () => void;
  onUnassign: () => void;
  onUpdateStatus: (uiStatus: OrderStatus) => void;
  onUpdateBackendStatus: (backendStatus: string) => void;
};

export function AdminOrderItem({
  order,
  assignValue,
  onChangeAssignValue,
  busyAssign,
  busyStatus,
  onPressView,
  onAssign,
  onUnassign,
  onUpdateStatus,
  onUpdateBackendStatus,
}: AdminOrderItemProps) {
  const { q, setQ, loading: searching, results, clear } = useCourierSearch('');

  const pickCourier = (id: number, display?: string | null) => {
    onChangeAssignValue(String(id));
    if (display) setQ(display);
    clear();
  };

  return (
    <View
      className="border border-slate-200 rounded-xl p-4 mb-3 bg-white"
      style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
    >
      <Text className="font-quicksand-bold text-slate-800">#{order.id} · {order.type?.toUpperCase()} · {statusLabel[mapBackendStatus(String(order.status))]}</Text>
      <Text className="text-slate-600 mt-1">{order.pickupAddress} → {order.dropoffAddress}</Text>
      <Text className="text-slate-600 mt-1">Poids: {order.weight}kg · Colis: {order.parcels}</Text>
      <Text className="text-slate-600 mt-1">Assigné à: {order.assignedTo ?? '—'}</Text>
      <View className="mt-2">
        <TouchableOpacity
          className="self-start px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300"
          onPress={onPressView}
          accessibilityLabel={`Voir les détails de la commande #${order.id}`}
        >
          <Text className="text-emerald-700 text-xs font-quicksand-bold">Voir</Text>
        </TouchableOpacity>
      </View>

      {/* Rechercher livreur (autocomplétion) */}
      <View className="mt-3">
        <Text className="text-slate-600 mb-1">Rechercher livreur</Text>
        <TextInput
          className="border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Nom du livreur"
          value={q}
          onChangeText={setQ}
          accessibilityLabel={`Rechercher un livreur par nom pour la commande #${order.id}`}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searching ? (
          <View className="mt-2"><ActivityIndicator size="small" color="#64748b" /></View>
        ) : null}
        {results.length > 0 && (
          <View className="mt-2 border border-slate-200 rounded-lg bg-white">
            {results.map((u) => (
              <TouchableOpacity key={u.id} className="px-3 py-2 border-b border-slate-100" onPress={() => pickCourier(u.id!, u.name ?? null)} accessibilityLabel={`Choisir ${u.name ?? 'livreur'} (${u.phone ?? '—'})`}>
                <Text className="text-slate-800">{u.name ?? '(Sans nom)'} <Text className="text-slate-500">· #{u.id}</Text></Text>
                {u.phone ? <Text className="text-slate-500 text-xs">{u.phone}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <View className="mt-2 flex-row items-center gap-2">
        <TextInput
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
          placeholder="ID du livreur"
          keyboardType="number-pad"
          value={assignValue}
          onChangeText={onChangeAssignValue}
          accessibilityLabel={`Saisir l'ID du livreur pour la commande #${order.id}`}
        />
        <TouchableOpacity
          className={`px-3 py-2 rounded-lg ${busyAssign ? 'bg-emerald-300' : 'bg-emerald-600'}`}
          disabled={busyAssign}
          onPress={onAssign}
          accessibilityLabel={`Assigner la commande #${order.id}`}
          accessibilityState={{ disabled: busyAssign }}
        >
          {busyAssign ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white">Assigner</Text>
          )}
        </TouchableOpacity>
        {order.assignedTo != null && (
          <TouchableOpacity
            className={`px-3 py-2 rounded-lg ${busyAssign ? 'bg-rose-300' : 'bg-rose-600'}`}
            disabled={busyAssign}
            onPress={onUnassign}
            accessibilityLabel={`Retirer l'assignation de la commande #${order.id}`}
            accessibilityState={{ disabled: busyAssign }}
          >
            {busyAssign ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white">Retirer</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* Status actions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
        {(() => {
          const pipeline: OrderStatus[] = ['CREATED','PICKED_UP','IN_TRANSIT','DELIVERED'];
          const currentUi = mapBackendStatus(String(order.status)) as OrderStatus;
          const idxCurrent = Math.max(0, pipeline.indexOf(currentUi));
          return pipeline.map((ui, i) => {
            const isCurrent = i === idxCurrent;
            const isNext = i === idxCurrent + 1;
            const enabled = !busyStatus && isNext; // on n'autorise que l'étape suivante
            const cls = enabled
              ? 'bg-emerald-600 border-emerald-700'
              : isCurrent
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-slate-100 border-slate-300';
            const textCls = enabled ? 'text-white' : isCurrent ? 'text-emerald-700' : 'text-slate-400';
            return (
              <TouchableOpacity
                key={ui}
                className={`px-3 py-2 rounded-full border ${cls}`}
                disabled={!enabled}
                onPress={() => enabled && onUpdateStatus(ui)}
                accessibilityLabel={`Changer le statut en ${statusLabel[ui]} pour la commande #${order.id}`}
                accessibilityState={{ disabled: !enabled }}
              >
                <Text className={`${textCls} text-xs font-quicksand-bold`}>{statusLabel[ui]}</Text>
              </TouchableOpacity>
            );
          });
        })()}
        <TouchableOpacity
          className={`px-3 py-2 rounded-full border ${(() => {
            const cur = String(order.status);
            const allowed = cur === 'en_chemin';
            return allowed ? 'bg-emerald-600 border-emerald-700' : 'bg-slate-100 border-slate-300';
          })()}`}
          disabled={(() => String(order.status) !== 'en_chemin')()}
          onPress={() => String(order.status) === 'en_chemin' && onUpdateBackendStatus('en_chemin_pour_livraison')}
          accessibilityState={{ disabled: String(order.status) !== 'en_chemin' }}
        >
          <Text className={`${String(order.status) === 'en_chemin' ? 'text-white' : 'text-slate-400'} text-xs font-quicksand-bold`}>En chemin pour la livraison</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
