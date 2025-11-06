import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Order } from '@/lib/api/models/Order';
import { mapBackendStatus, statusLabel, type OrderStatus } from '@/lib/mappers/order';
import { useCourierSearch } from '../hooks/useCourierSearch';
import { Package, MapPin, Weight, User, Search, ArrowRight, Eye } from 'lucide-react-native';

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

const statusColors: Record<OrderStatus, { gradient: string[]; text: string }> = {
  CREATED: { gradient: ['#3B82F6', '#2563EB'], text: '#fff' },
  PICKED_UP: { gradient: ['#F59E0B', '#D97706'], text: '#fff' },
  IN_TRANSIT: { gradient: ['#8B5CF6', '#7C3AED'], text: '#fff' },
  DELIVERED: { gradient: ['#059669', '#047857'], text: '#fff' },
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

  const currentUi = mapBackendStatus(String(order.status)) as OrderStatus;
  const statusColor = statusColors[currentUi] || { gradient: ['#64748B', '#475569'], text: '#fff' };

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-emerald-100 rounded-lg p-2">
            <Package size={18} color="#059669" strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-gray-900 font-clash-bold text-lg">#{order.id}</Text>
            <View className="flex-row items-center gap-2 mt-0.5">
              <View className={`px-2 py-0.5 rounded-full`} style={{ backgroundColor: statusColor.gradient[0] + '20' }}>
                <Text className="text-xs font-quicksand-bold" style={{ color: statusColor.gradient[0] }}>
                  {order.type?.toUpperCase()}
                </Text>
              </View>
              <View className={`px-2 py-0.5 rounded-full`} style={{ backgroundColor: statusColor.gradient[0] + '20' }}>
                <Text className="text-xs font-quicksand-bold" style={{ color: statusColor.gradient[0] }}>
                  {statusLabel[currentUi]}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={onPressView}
          className="bg-emerald-50 rounded-lg px-3 py-2 flex-row items-center gap-1.5"
          activeOpacity={0.7}
        >
          <Eye size={16} color="#059669" />
          <Text className="text-emerald-700 text-xs font-quicksand-bold">Voir</Text>
        </TouchableOpacity>
      </View>

      {/* Informations */}
      <View className="mb-4">
        <View className="flex-row items-start gap-2">
          <View style={{ marginTop: 2 }}>
            <MapPin size={16} color="#64748B" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-quicksand-semibold text-sm" numberOfLines={1}>
              {order.pickupAddress}
            </Text>
            <View style={{ marginVertical: 4 }}>
              <ArrowRight size={12} color="#94A3B8" />
            </View>
            <Text className="text-gray-700 font-quicksand text-sm" numberOfLines={1}>
              {order.dropoffAddress}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-4 mb-2">
          <View className="flex-row items-center gap-1.5">
            <Weight size={14} color="#64748B" />
            <Text className="text-gray-600 text-xs font-quicksand">
              {order.weight}kg · {order.parcels} colis
            </Text>
          </View>
        </View>
        {order.assignedTo && (
          <View className="flex-row items-center gap-2">
            <User size={14} color="#64748B" />
            <Text className="text-gray-600 text-xs font-quicksand">
              Assigné à: <Text className="font-quicksand-semibold">{order.assignedTo}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Recherche livreur */}
      <View className="mb-3">
        <Text className="text-gray-700 text-xs font-quicksand-semibold mb-2">Rechercher livreur</Text>
        <View className="relative">
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            <Search size={16} color="#94A3B8" />
          </View>
          <TextInput
            className="border border-gray-200 rounded-xl px-10 py-3 bg-gray-50 font-quicksand"
            placeholder="Nom du livreur"
            value={q}
            onChangeText={setQ}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        {searching && (
          <View className="mt-2">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}
        {results.length > 0 && (
          <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {results.map((u) => (
              <TouchableOpacity
                key={u.id}
                className="px-4 py-3 border-b border-gray-100 last:border-0"
                onPress={() => pickCourier(u.id!, u.name ?? null)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-900 font-quicksand-semibold">
                  {u.name ?? '(Sans nom)'}
                </Text>
                <Text className="text-gray-500 text-xs font-quicksand mt-0.5">
                  #{u.id} {u.phone ? `· ${u.phone}` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Assignation */}
      <View className="flex-row items-center gap-2 mb-4">
        <TextInput
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
          placeholder="ID du livreur"
          keyboardType="number-pad"
          value={assignValue}
          onChangeText={onChangeAssignValue}
        />
        <TouchableOpacity
          className={`rounded-xl overflow-hidden ${busyAssign ? 'opacity-50' : ''}`}
          disabled={busyAssign}
          onPress={onAssign}
          activeOpacity={0.7}
        >
          <LinearGradient colors={['#059669', '#047857']} className="px-4 py-3">
            {busyAssign ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-quicksand-bold text-sm">Assigner</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        {order.assignedTo != null && (
          <TouchableOpacity
            className={`rounded-xl overflow-hidden ${busyAssign ? 'opacity-50' : ''}`}
            disabled={busyAssign}
            onPress={onUnassign}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#EF4444', '#DC2626']} className="px-4 py-3">
              {busyAssign ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-quicksand-bold text-sm">Retirer</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Status actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {(() => {
          const pipeline: OrderStatus[] = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
          const idxCurrent = Math.max(0, pipeline.indexOf(currentUi));
          return pipeline.map((ui, i) => {
            const isCurrent = i === idxCurrent;
            const isNext = i === idxCurrent + 1;
            const enabled = !busyStatus && isNext;
            const color = statusColors[ui] || { gradient: ['#64748B', '#475569'], text: '#fff' };

            return (
              <TouchableOpacity
                key={ui}
                className="rounded-full overflow-hidden"
                disabled={!enabled}
                onPress={() => enabled && onUpdateStatus(ui)}
                activeOpacity={0.7}
              >
                {enabled ? (
                  <LinearGradient colors={color.gradient} className="px-4 py-2">
                    <Text className="text-white text-xs font-quicksand-bold">{statusLabel[ui]}</Text>
                  </LinearGradient>
                ) : (
                  <View
                    className={`px-4 py-2 ${
                      isCurrent ? 'bg-emerald-50' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-quicksand-bold ${
                        isCurrent ? 'text-emerald-700' : 'text-gray-400'
                      }`}
                    >
                      {statusLabel[ui]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          });
        })()}
        <TouchableOpacity
          className={`rounded-full overflow-hidden ${
            String(order.status) === 'en_chemin' ? '' : 'opacity-50'
          }`}
          disabled={String(order.status) !== 'en_chemin'}
          onPress={() => String(order.status) === 'en_chemin' && onUpdateBackendStatus('en_chemin_pour_livraison')}
          activeOpacity={0.7}
        >
          {String(order.status) === 'en_chemin' ? (
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} className="px-4 py-2">
              <Text className="text-white text-xs font-quicksand-bold">En chemin pour livraison</Text>
            </LinearGradient>
          ) : (
            <View className="px-4 py-2 bg-gray-100">
              <Text className="text-gray-400 text-xs font-quicksand-bold">En chemin pour livraison</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
