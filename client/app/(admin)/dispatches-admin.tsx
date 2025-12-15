import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminDispatches } from '../../lib/hooks/useAdminDispatches';

export default function AdminDispatchesScreen() {
  const { dispatches, loading, fetchDispatches } = useAdminDispatches();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'WAITING_COURIER' | 'IN_PROGRESS' | 'COMPLETED'>('WAITING_COURIER');

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDispatches();
    setRefreshing(false);
  };

  const filteredDispatches = dispatches.filter((d) => d.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_COURIER':
        return 'bg-amber-100 text-amber-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'WAITING_COURIER':
        return 'En attente livreur';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      default:
        return status;
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <Text className="text-xl font-quicksand-bold text-slate-900">
          Versements Clients J+1
        </Text>
        <Text className="text-sm text-slate-600 font-quicksand mt-1">
          {dispatches.length} dispatch(es) au total
        </Text>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-slate-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2">
          <View className="flex-row gap-2">
            {['WAITING_COURIER', 'IN_PROGRESS', 'COMPLETED'].map((tab) => {
              const count = dispatches.filter((d) => d.status === tab).length;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-full ${
                    activeTab === tab ? 'bg-purple-600' : 'bg-slate-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-quicksand-semibold ${
                      activeTab === tab ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {getStatusLabel(tab)} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && !refreshing ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#9333EA" />
          </View>
        ) : filteredDispatches.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="wallet-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-500 font-quicksand mt-3">
              Aucun dispatch {getStatusLabel(activeTab).toLowerCase()}
            </Text>
          </View>
        ) : (
          <View className="p-4 gap-3">
            {filteredDispatches.map((dispatch) => (
              <View
                key={dispatch.id}
                className="bg-white rounded-2xl p-4 border border-slate-200"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-quicksand-bold text-slate-900">
                      {dispatch.clientName}
                    </Text>
                    <Text className="text-sm text-slate-600 font-quicksand mt-0.5">
                      Livreur: {dispatch.courierName}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-lg ${getStatusColor(dispatch.status)}`}>
                    <Text className={`text-xs font-quicksand-semibold ${getStatusColor(dispatch.status).split(' ')[1]}`}>
                      {getStatusLabel(dispatch.status)}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-50 rounded-xl p-3 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-slate-600 font-quicksand">Montant net</Text>
                    <Text className="text-sm text-slate-900 font-quicksand-bold">
                      {dispatch.netAmount?.toLocaleString() || 0} Ar
                    </Text>
                  </View>
                  {dispatch.cashAmount !== null && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-sm text-slate-600 font-quicksand">Cash</Text>
                      <Text className="text-sm text-slate-900 font-quicksand-bold">
                        {dispatch.cashAmount.toLocaleString()} Ar
                      </Text>
                    </View>
                  )}
                  {dispatch.mobileMoneyAmount !== null && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-600 font-quicksand">Mobile Money</Text>
                      <Text className="text-sm text-slate-900 font-quicksand-bold">
                        {dispatch.mobileMoneyAmount.toLocaleString()} Ar
                      </Text>
                    </View>
                  )}
                </View>

                {dispatch.orders && dispatch.orders.length > 0 && (
                  <View className="bg-blue-50 rounded-xl p-3">
                    <Text className="text-xs text-blue-900 font-quicksand-semibold mb-1">
                      {dispatch.orders.length} commande(s)
                    </Text>
                    {dispatch.orders.slice(0, 3).map((order: any) => (
                      <Text key={order.id} className="text-xs text-blue-700 font-quicksand">
                        • Commande #{order.id} - {order.clientNet?.toLocaleString() || 0} Ar
                      </Text>
                    ))}
                    {dispatch.orders.length > 3 && (
                      <Text className="text-xs text-blue-600 font-quicksand mt-1">
                        +{dispatch.orders.length - 3} autre(s)...
                      </Text>
                    )}
                  </View>
                )}

                <Text className="text-xs text-slate-500 font-quicksand mt-3">
                  Créé le {new Date(dispatch.createdAt).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
