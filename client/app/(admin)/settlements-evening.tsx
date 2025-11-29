import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CalendarDays, User, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useAdminEveningSettlements } from './hooks/useAdminEveningSettlements';

export default function AdminEveningSettlementsScreen() {
  const router = useRouter();
  const {
    date,
    setDate,
    courierIdInput,
    setCourierIdInput,
    data,
    loading,
    error,
    summary,
    load,
    confirming,
    confirm,
  } = useAdminEveningSettlements();

  const onChangeDate = React.useCallback(
    (value: string) => {
      const trimmed = value.trim();
      setDate(trimmed || date);
    },
    [date, setDate]
  );

  const hasItems = !!data && data.items.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Règlement du soir</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Vue des encaissements livreur → admin</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4 pb-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <Text className="text-gray-900 font-quicksand-semibold text-sm mb-3">Filtres</Text>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-quicksand mb-1">Date (AAAA-MM-JJ)</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <CalendarDays size={18} color="#64748B" />
                  <TextInput
                    value={date}
                    onChangeText={onChangeDate}
                    placeholder="2025-01-01"
                    className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-quicksand mb-1">ID livreur (optionnel)</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <User size={18} color="#64748B" />
                  <TextInput
                    value={courierIdInput}
                    onChangeText={setCourierIdInput}
                    placeholder="Ex: 12"
                    className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={load}
              activeOpacity={0.7}
              className="mt-1 flex-row items-center justify-center bg-emerald-600 rounded-xl py-2.5"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RefreshCw size={18} color="#fff" />
                  <Text className="ml-2 text-white text-sm font-quicksand-semibold">Charger le règlement</Text>
                </>
              )}
            </TouchableOpacity>

            {error && <Text className="mt-2 text-xs text-red-600 font-quicksand">{error}</Text>}
          </View>

          {summary && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <Text className="text-gray-900 font-quicksand-bold text-sm mb-3">Synthèse</Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[130px] bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <Text className="text-emerald-700 text-xs font-quicksand-medium mb-1">Livraisons</Text>
                  <Text className="text-2xl font-clash-bold text-emerald-800">{summary.totalOrders}</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-sky-50 rounded-xl p-3 border border-sky-100">
                  <Text className="text-sky-700 text-xs font-quicksand-medium mb-1">Encaissements livreur</Text>
                  <Text className="text-lg font-clash-bold text-sky-800">{summary.totalCourierCollected} Ar</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <Text className="text-amber-700 text-xs font-quicksand-medium mb-1">Net client</Text>
                  <Text className="text-lg font-clash-bold text-amber-800">{summary.totalClientNet} Ar</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <Text className="text-indigo-700 text-xs font-quicksand-medium mb-1">Net admin</Text>
                  <Text className="text-lg font-clash-bold text-indigo-800">{summary.totalAdminNet} Ar</Text>
                </View>
              </View>
              {data?.courierId != null && (
                <View className="mt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className={`px-3 py-1 rounded-full ${
                        data?.settlement?.status === 'CONFIRMED'
                          ? 'bg-emerald-50'
                          : data?.settlement
                          ? 'bg-amber-50'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-quicksand-semibold ${
                          data?.settlement?.status === 'CONFIRMED'
                            ? 'text-emerald-700'
                            : data?.settlement
                            ? 'text-amber-700'
                            : 'text-gray-500'
                        }`}
                      >
                        {data?.settlement?.status === 'CONFIRMED'
                          ? 'Règlement confirmé'
                          : data?.settlement
                          ? 'Règlement déclaré'
                          : 'Règlement non enregistré'}
                      </Text>
                    </View>
                  </View>
                  {data?.settlement?.status !== 'CONFIRMED' && (
                    <TouchableOpacity
                      onPress={confirm}
                      activeOpacity={0.7}
                      className="flex-row items-center px-3 py-1.5 rounded-full bg-emerald-600"
                      disabled={confirming}
                    >
                      {confirming ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-white text-xs font-quicksand-semibold">Confirmer règlement</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {loading && !hasItems && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          )}

          {data && !hasItems && !loading && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <Text className="text-gray-500 text-sm font-quicksand">
                Aucune livraison trouvée pour cette date.
              </Text>
            </View>
          )}

          {hasItems && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-900 font-quicksand-bold text-sm">Détail des livraisons</Text>
                <Text className="text-gray-400 text-xs font-quicksand">{data?.items.length} livraisons</Text>
              </View>
              {data?.items.map((item) => {
                const clientPositive = item.clientNet > 0;
                const adminPositive = item.adminNet > 0;
                return (
                  <View key={item.id} className="py-3 border-b border-gray-100 last:border-0">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-gray-900 font-quicksand-semibold text-sm">
                        Commande #{item.id}
                      </Text>
                      <Text className="text-[10px] font-quicksand text-gray-400">{item.status}</Text>
                    </View>
                    <Text className="text-[11px] text-gray-500 font-quicksand mb-1">
                      Encaissement: {item.courierCollected} Ar • Frais: {item.deliveryFee} Ar
                    </Text>
                    <View className="flex-row gap-3 mt-1">
                      <View
                        className={`flex-1 rounded-lg px-2 py-1 ${
                          clientPositive ? 'bg-emerald-50' : 'bg-rose-50'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-quicksand-medium ${
                            clientPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          Net client
                        </Text>
                        <Text
                          className={`text-xs font-clash-bold ${
                            clientPositive ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {item.clientNet} Ar
                        </Text>
                      </View>
                      <View
                        className={`flex-1 rounded-lg px-2 py-1 ${
                          adminPositive ? 'bg-emerald-50' : 'bg-rose-50'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-quicksand-medium ${
                            adminPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          Net admin
                        </Text>
                        <Text
                          className={`text-xs font-clash-bold ${
                            adminPositive ? 'text-emerald-800' : 'text-rose-800'
                          }`}
                        >
                          {item.adminNet} Ar
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
