import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, Wallet, Package, ChevronDown } from 'lucide-react-native';
import { useCourierEveningSettlement } from '../../lib/hooks/useCourierEveningSettlement';

const MOBILE_MONEY_PROVIDERS = [
  { value: 'MVOLA', label: 'MVola', color: '#00A651' },
  { value: 'AIRTEL', label: 'Airtel Money', color: '#ED1C24' },
  { value: 'ORANGE', label: 'Orange Money', color: '#FF7900' },
  { value: 'TELMA', label: 'Telma Cash', color: '#000000' },
] as const;

type MobileMoneyProvider = 'MVOLA' | 'AIRTEL' | 'ORANGE' | 'TELMA';

export default function CourierEveningSettlementScreen() {
  const router = useRouter();
  const {
    date,
    data,
    loading,
    error,
    summary,
    cashAmount,
    setCashAmount,
    mobileMoneyAmount,
    setMobileMoneyAmount,
    mobileMoneyProvider,
    setMobileMoneyProvider,
    declaring,
    load,
    declareSettlement,
  } = useCourierEveningSettlement();

  const [showProviderPicker, setShowProviderPicker] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const hasItems = !!data && data.items.length > 0;
  const settlement = data?.settlement;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Règlement du soir</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Bilan quotidien & versement à l'admin</Text>
        </View>
        <TouchableOpacity
          onPress={load}
          className="ml-3 rounded-full bg-emerald-50 p-2"
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4 pb-6">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
              <Text className="text-red-600 text-xs font-quicksand">{error}</Text>
            </View>
          )}

          {summary && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <Text className="text-gray-900 font-quicksand-bold text-sm mb-3">Synthèse du {date}</Text>
              <View className="flex-row flex-wrap gap-3">
                <View className="flex-1 min-w-[130px] bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <Text className="text-emerald-700 text-xs font-quicksand-medium mb-1">Livraisons</Text>
                  <Text className="text-2xl font-clash-bold text-emerald-800">{summary.totalOrders}</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-sky-50 rounded-xl p-3 border border-sky-100">
                  <Text className="text-sky-700 text-xs font-quicksand-medium mb-1">Encaissé</Text>
                  <Text className="text-lg font-clash-bold text-sky-800">{summary.totalCourierCollected} Ar</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <Text className="text-amber-700 text-xs font-quicksand-medium mb-1">Net client</Text>
                  <Text className="text-lg font-clash-bold text-amber-800">{summary.totalClientNet} Ar</Text>
                </View>
                <View className="flex-1 min-w-[130px] bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <Text className="text-indigo-700 text-xs font-quicksand-medium mb-1">À verser admin</Text>
                  <Text className="text-lg font-clash-bold text-indigo-800">{summary.totalAdminNet} Ar</Text>
                </View>
              </View>
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
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-900 font-quicksand-bold text-sm">Détail des livraisons</Text>
                <Text className="text-gray-400 text-xs font-quicksand">{data?.items.length} livraisons</Text>
              </View>
              {data?.items.map((item, idx) => (
                <View
                  key={item.id}
                  className={`py-3 ${idx < data.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-gray-900 font-quicksand-semibold text-sm">
                      Commande #{item.id}
                    </Text>
                    <View className="bg-emerald-50 rounded-full px-2 py-0.5">
                      <Text className="text-emerald-700 text-xs font-quicksand-semibold">
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-xs text-gray-500 font-quicksand">Encaissé: {item.courierCollected} Ar</Text>
                    <Text className="text-xs text-gray-500 font-quicksand">Net client: {item.clientNet} Ar</Text>
                    <Text className="text-xs text-gray-500 font-quicksand">Net admin: {item.adminNet} Ar</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {summary && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <Text className="text-gray-900 font-quicksand-bold text-sm mb-3">Déclaration de versement</Text>

              {settlement && (
                <View className={`mb-3 p-3 rounded-xl ${
                  settlement.status === 'CONFIRMED' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                }`}>
                  <Text className={`text-xs font-quicksand-semibold ${
                    settlement.status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {settlement.status === 'CONFIRMED'
                      ? `✓ Règlement confirmé par l'admin`
                      : `⏳ Règlement déclaré le ${new Date(settlement.declaredAt || '').toLocaleDateString('fr-FR')}`}
                  </Text>
                  {(settlement.cashAmount != null || settlement.mobileMoneyAmount != null) && (
                    <Text className="text-xs text-gray-600 font-quicksand mt-1">
                      {settlement.cashAmount != null && `Cash: ${settlement.cashAmount.toLocaleString('fr-FR')} Ar`}
                      {settlement.cashAmount != null && settlement.mobileMoneyAmount != null && ' · '}
                      {settlement.mobileMoneyAmount != null && settlement.mobileMoneyProvider
                        ? `Payé via ${MOBILE_MONEY_PROVIDERS.find(p => p.value === settlement.mobileMoneyProvider)?.label || settlement.mobileMoneyProvider}: ${settlement.mobileMoneyAmount.toLocaleString('fr-FR')} Ar`
                        : `Mobile Money: ${settlement.mobileMoneyAmount.toLocaleString('fr-FR')} Ar`}
                    </Text>
                  )}
                </View>
              )}

              <View className="mb-3">
                <Text className="text-gray-500 text-xs font-quicksand mb-1">Montant cash versé (Ar)</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <Wallet size={18} color="#64748B" />
                  <TextInput
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholder="0"
                    className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-gray-500 text-xs font-quicksand mb-1">Montant mobile money versé (Ar)</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                  <Package size={18} color="#64748B" />
                  <TextInput
                    value={mobileMoneyAmount}
                    onChangeText={setMobileMoneyAmount}
                    placeholder="0"
                    className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Sélecteur de fournisseur Mobile Money */}
              {(mobileMoneyAmount && parseInt(mobileMoneyAmount, 10) > 0) && (
                <View className="mb-3">
                  <Text className="text-gray-500 text-xs font-quicksand mb-1">Fournisseur Mobile Money</Text>
                  <TouchableOpacity
                    onPress={() => setShowProviderPicker(true)}
                    className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-gray-50"
                  >
                    <View className="flex-row items-center flex-1">
                      {mobileMoneyProvider ? (
                        <>
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: MOBILE_MONEY_PROVIDERS.find(p => p.value === mobileMoneyProvider)?.color || '#64748B' }}
                          />
                          <Text className="text-gray-900 text-sm font-quicksand-semibold">
                            {MOBILE_MONEY_PROVIDERS.find(p => p.value === mobileMoneyProvider)?.label}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-gray-400 text-sm font-quicksand">Sélectionner...</Text>
                      )}
                    </View>
                    <ChevronDown size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              )}

              {mobileMoneyAmount && parseInt(mobileMoneyAmount, 10) > 0 && !mobileMoneyProvider && (
                <View className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-2">
                  <Text className="text-xs text-amber-700 font-quicksand text-center">
                    ⚠️ Veuillez sélectionner le fournisseur de mobile money
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={declareSettlement}
                activeOpacity={0.7}
                disabled={declaring}
                className={`mt-1 flex-row items-center justify-center bg-emerald-600 rounded-xl py-3 ${
                  declaring ? 'opacity-50' : ''
                }`}
              >
                {declaring ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Wallet size={18} color="#fff" />
                    <Text className="ml-2 text-white text-sm font-quicksand-semibold">
                      Déclarer mon versement du soir
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de sélection du fournisseur Mobile Money */}
      {showProviderPicker && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-4 w-full">
            <Text className="text-base font-quicksand-bold text-gray-900 mb-3">
              Sélectionner le fournisseur
            </Text>
            {MOBILE_MONEY_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.value}
                onPress={() => {
                  setMobileMoneyProvider(provider.value);
                  setShowProviderPicker(false);
                }}
                className={`flex-row items-center justify-between py-3 px-4 rounded-xl mb-2 ${
                  mobileMoneyProvider === provider.value ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: provider.color }}
                  />
                  <Text className="text-sm font-quicksand-semibold text-gray-900">
                    {provider.label}
                  </Text>
                </View>
                {mobileMoneyProvider === provider.value && (
                  <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setShowProviderPicker(false);
              }}
              className="mt-2 py-2"
            >
              <Text className="text-center text-gray-500 text-sm font-quicksand">Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
