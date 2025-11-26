import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, User, Wallet, ListChecks } from 'lucide-react-native';
import { useAdminDispatches } from './hooks/useAdminDispatches';

export default function AdminDispatchesScreen() {
  const router = useRouter();
  const {
    pendingClients,
    loadingPending,
    errorPending,
    dispatches,
    loadingDispatches,
    errorDispatches,
    creatingClientId,
    refreshAll,
    createDispatch,
  } = useAdminDispatches();

  const [viewTab, setViewTab] = React.useState<'pending' | 'list'>('pending');
  const [courierInputs, setCourierInputs] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    refreshAll().catch(() => {});
  }, [refreshAll]);

  const setCourierInput = React.useCallback((clientId: number, value: string) => {
    setCourierInputs((prev) => ({ ...prev, [clientId]: value }));
  }, []);

  const hasPending = pendingClients.length > 0;
  const hasDispatches = dispatches.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Dispatches J+1</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Vue des règlements Admin → Clients</Text>
        </View>
        <TouchableOpacity
          onPress={() => refreshAll()}
          className="ml-3 rounded-full bg-emerald-50 p-2"
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-4 mt-3 mb-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        <TouchableOpacity
          onPress={() => setViewTab('pending')}
          className={`flex-1 rounded-xl py-2 items-center ${
            viewTab === 'pending' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              viewTab === 'pending' ? 'text-white' : 'text-gray-600'
            }`}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewTab('list')}
          className={`flex-1 rounded-xl py-2 items-center ${
            viewTab === 'list' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              viewTab === 'list' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Dispatches
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-2 pb-6">
          {viewTab === 'pending' ? (
            <View>
              {errorPending && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                  <Text className="text-red-600 text-xs font-quicksand">{errorPending}</Text>
                </View>
              )}

              {loadingPending && !hasPending && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              )}

              {!loadingPending && !hasPending && !errorPending && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <Text className="text-gray-500 text-sm font-quicksand">
                    Aucun client en attente de dispatch pour le moment.
                  </Text>
                </View>
              )}

              {hasPending && (
                <View className="space-y-3">
                  {pendingClients.map((item) => {
                    const clientId = item.clientId as number;
                    const net = item.netClient ?? 0;
                    const positive = net > 0;
                    const courierValue = courierInputs[clientId] ?? '';
                    const ordersCount = item.orders?.length ?? 0;

                    return (
                      <View
                        key={clientId}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-1 mr-2">
                            <Text className="text-gray-900 font-quicksand-bold text-sm">
                              {item.clientName || `Client #${clientId}`}
                            </Text>
                            <Text className="text-gray-400 text-[11px] font-quicksand">
                              {item.clientPhone || item.clientEmail || 'Coordonnées non renseignées'}
                            </Text>
                          </View>
                          <View
                            className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                              positive ? 'bg-emerald-50' : 'bg-rose-50'
                            }`}
                          >
                            <Wallet
                              size={14}
                              color={positive ? '#059669' : '#E11D48'}
                            />
                            <Text
                              className={`text-[11px] font-quicksand-semibold ${
                                positive ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {net} Ar
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-gray-500 text-xs font-quicksand">
                            {ordersCount} livraisons incluses dans le net.
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <ListChecks size={14} color="#64748B" />
                            <Text className="text-[11px] text-gray-500 font-quicksand">
                              Dispatch J+1
                            </Text>
                          </View>
                        </View>

                        <View className="mb-3">
                          <Text className="text-gray-500 text-xs font-quicksand mb-1">
                            ID livreur (numérique)
                          </Text>
                          <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                            <User size={18} color="#64748B" />
                            <TextInput
                              value={courierValue}
                              onChangeText={(v) => setCourierInput(clientId, v)}
                              placeholder="Ex: 5"
                              className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                              keyboardType="number-pad"
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => createDispatch(clientId, courierValue)}
                          activeOpacity={0.7}
                          disabled={creatingClientId === clientId}
                          className="mt-1 flex-row items-center justify-center bg-emerald-600 rounded-xl py-2.5"
                        >
                          {creatingClientId === clientId ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text className="text-white text-sm font-quicksand-semibold">
                              Créer le dispatch
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View>
              {errorDispatches && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                  <Text className="text-red-600 text-xs font-quicksand">{errorDispatches}</Text>
                </View>
              )}

              {loadingDispatches && !hasDispatches && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              )}

              {!loadingDispatches && !hasDispatches && !errorDispatches && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <Text className="text-gray-500 text-sm font-quicksand">
                    Aucun dispatch créé pour le moment.
                  </Text>
                </View>
              )}

              {hasDispatches && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-900 font-quicksand-bold text-sm">
                      Dispatches récents
                    </Text>
                    <Text className="text-gray-400 text-xs font-quicksand">
                      {dispatches.length} éléments
                    </Text>
                  </View>

                  {dispatches.map((d) => {
                    const net = d.netAmount ?? 0;
                    const status = d.status ?? 'WAITING_COURIER';
                    const statusLabel =
                      status === 'COMPLETED'
                        ? 'Terminé'
                        : status === 'IN_PROGRESS'
                        ? 'En cours'
                        : 'En attente du livreur';
                    const statusColor =
                      status === 'COMPLETED'
                        ? 'bg-emerald-50'
                        : status === 'IN_PROGRESS'
                        ? 'bg-amber-50'
                        : 'bg-sky-50';
                    const statusTextColor =
                      status === 'COMPLETED'
                        ? 'text-emerald-700'
                        : status === 'IN_PROGRESS'
                        ? 'text-amber-700'
                        : 'text-sky-700';

                    return (
                      <View
                        key={d.id}
                        className="py-3 border-b border-gray-100 last:border-0"
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-gray-900 font-quicksand-semibold text-sm">
                            Dispatch #{d.id}
                          </Text>
                          <View
                            className={`px-3 py-1 rounded-full ${statusColor}`}
                          >
                            <Text
                              className={`text-[11px] font-quicksand-semibold ${statusTextColor}`}
                            >
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-[11px] text-gray-500 font-quicksand mb-1">
                          Client #{d.clientId} • Livreur #{d.courierId}
                        </Text>
                        <View className="flex-row gap-3 mt-1">
                          <View className="flex-1 rounded-lg px-2 py-1 bg-emerald-50">
                            <Text className="text-[10px] font-quicksand-medium text-emerald-700">
                              Net client
                            </Text>
                            <Text className="text-xs font-clash-bold text-emerald-800">
                              {net} Ar
                            </Text>
                          </View>
                          <View className="flex-1 rounded-lg px-2 py-1 bg-sky-50">
                            <Text className="text-[10px] font-quicksand-medium text-sky-700">
                              Cash / Mobile
                            </Text>
                            <Text className="text-xs font-clash-bold text-sky-800">
                              {(d.cashAmount ?? 0)} Ar / {(d.mobileMoneyAmount ?? 0)} Ar
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
