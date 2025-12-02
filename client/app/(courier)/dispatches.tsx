import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, User, Wallet, CheckCircle } from 'lucide-react-native';
import { useCourierDispatches } from '../../lib/hooks/useCourierDispatches';

type TabType = 'in_progress' | 'completed';

export default function CourierDispatchesScreen() {
  const router = useRouter();
  const { dispatches, loading, error, updatingId, load, updateStatus } = useCourierDispatches();
  const [tab, setTab] = useState<TabType>('in_progress');

  useEffect(() => {
    load();
  }, [load]);

  const inProgress = dispatches.filter((d) => d.status === 'WAITING_COURIER' || d.status === 'IN_PROGRESS');
  const completed = dispatches.filter((d) => d.status === 'COMPLETED');

  const items = tab === 'in_progress' ? inProgress : completed;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Versements clients J+1</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Règlements à effectuer aux clients</Text>
        </View>
        <TouchableOpacity
          onPress={() => load()}
          className="ml-3 rounded-full bg-emerald-50 p-2"
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mx-4 mt-3 mb-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        <TouchableOpacity
          onPress={() => setTab('in_progress')}
          className={`flex-1 rounded-xl py-2 items-center ${
            tab === 'in_progress' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              tab === 'in_progress' ? 'text-white' : 'text-gray-600'
            }`}
          >
            En cours ({inProgress.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('completed')}
          className={`flex-1 rounded-xl py-2 items-center ${
            tab === 'completed' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              tab === 'completed' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Effectués ({completed.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-2 pb-6">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
              <Text className="text-red-600 text-xs font-quicksand">{error}</Text>
            </View>
          )}

          {loading && items.length === 0 && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          )}

          {!loading && items.length === 0 && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <Text className="text-gray-500 text-sm font-quicksand text-center">
                {tab === 'in_progress'
                  ? 'Aucun versement en cours'
                  : 'Aucun versement effectué'}
              </Text>
            </View>
          )}

          {items.map((dispatch) => (
            <View
              key={dispatch.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="bg-emerald-50 rounded-lg p-2 mr-3">
                    <User size={20} color="#059669" />
                  </View>
                  <View>
                    <Text className="text-gray-900 font-quicksand-bold text-sm">
                      {dispatch.clientName || `Client #${dispatch.clientId}`}
                    </Text>
                    <Text className="text-gray-500 text-xs font-quicksand">
                      {dispatch.clientPhone || dispatch.clientEmail || '—'}
                    </Text>
                  </View>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    dispatch.status === 'COMPLETED'
                      ? 'bg-emerald-50'
                      : dispatch.status === 'IN_PROGRESS'
                      ? 'bg-amber-50'
                      : 'bg-sky-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-quicksand-semibold ${
                      dispatch.status === 'COMPLETED'
                        ? 'text-emerald-700'
                        : dispatch.status === 'IN_PROGRESS'
                        ? 'text-amber-700'
                        : 'text-sky-700'
                    }`}
                  >
                    {dispatch.status === 'COMPLETED'
                      ? 'Terminé'
                      : dispatch.status === 'IN_PROGRESS'
                      ? 'En cours'
                      : 'En attente'}
                  </Text>
                </View>
              </View>

              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-xs font-quicksand">Montant net</Text>
                  <Text className="text-gray-900 font-clash-bold text-sm">
                    {dispatch.netAmount} Ar
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-xs font-quicksand">Cash</Text>
                  <Text className="text-gray-900 font-quicksand-semibold text-xs">
                    {dispatch.cashAmount} Ar
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 text-xs font-quicksand">Mobile Money</Text>
                  <Text className="text-gray-900 font-quicksand-semibold text-xs">
                    {dispatch.mobileMoneyAmount} Ar
                  </Text>
                </View>
              </View>

              <Text className="text-gray-500 text-xs font-quicksand mb-2">
                {dispatch.orders.length} commande(s) concernée(s)
              </Text>

              {dispatch.status === 'WAITING_COURIER' && (
                <TouchableOpacity
                  onPress={() => updateStatus(dispatch.id, 'IN_PROGRESS')}
                  disabled={updatingId === dispatch.id}
                  className={`flex-row items-center justify-center bg-emerald-600 rounded-xl py-2 ${
                    updatingId === dispatch.id ? 'opacity-50' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  {updatingId === dispatch.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Wallet size={16} color="#fff" />
                      <Text className="ml-2 text-white text-xs font-quicksand-semibold">
                        Démarrer le versement
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {dispatch.status === 'IN_PROGRESS' && (
                <TouchableOpacity
                  onPress={() => updateStatus(dispatch.id, 'COMPLETED')}
                  disabled={updatingId === dispatch.id}
                  className={`flex-row items-center justify-center bg-emerald-600 rounded-xl py-2 ${
                    updatingId === dispatch.id ? 'opacity-50' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  {updatingId === dispatch.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#fff" />
                      <Text className="ml-2 text-white text-xs font-quicksand-semibold">
                        Confirmer le versement
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
