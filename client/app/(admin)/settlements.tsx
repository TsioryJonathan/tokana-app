import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminEveningSettlements } from '../../lib/hooks/useAdminEveningSettlements';

export default function AdminSettlementsScreen() {
  const { settlements, loading, fetchSettlements, confirmSettlement } = useAdminEveningSettlements();
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSettlements();
    setRefreshing(false);
  };

  const handleConfirm = (settlementId: number, courierName: string) => {
    Alert.alert(
      'Confirmer le règlement',
      `Confirmer le règlement du soir de ${courierName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setConfirming(settlementId);
            const success = await confirmSettlement(settlementId);
            setConfirming(null);
            if (success) {
              fetchSettlements();
            }
          },
        },
      ]
    );
  };

  const pendingSettlements = settlements.filter((s) => s.status === 'DECLARED');
  const confirmedSettlements = settlements.filter((s) => s.status === 'CONFIRMED');

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <Text className="text-xl font-quicksand-bold text-slate-900">
          Règlements du Soir
        </Text>
        <Text className="text-sm text-slate-600 font-quicksand mt-1">
          {pendingSettlements.length} en attente • {confirmedSettlements.length} confirmés
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && !refreshing ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : settlements.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-500 font-quicksand mt-3">Aucun règlement trouvé</Text>
          </View>
        ) : (
          <View className="p-4">
            {/* En attente de confirmation */}
            {pendingSettlements.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
                  EN ATTENTE DE CONFIRMATION
                </Text>
                <View className="gap-3">
                  {pendingSettlements.map((settlement) => (
                    <View
                      key={settlement.id}
                      className="bg-white rounded-2xl p-4 border-2 border-amber-200"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-base font-quicksand-bold text-slate-900">
                            {settlement.courierName}
                          </Text>
                          <Text className="text-sm text-slate-600 font-quicksand mt-0.5">
                            {new Date(settlement.date).toLocaleDateString('fr-FR')}
                          </Text>
                        </View>
                        <View className="bg-amber-100 px-3 py-1 rounded-lg">
                          <Text className="text-xs font-quicksand-semibold text-amber-700">
                            EN ATTENTE
                          </Text>
                        </View>
                      </View>

                      <View className="bg-slate-50 rounded-xl p-3 mb-3">
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-slate-600 font-quicksand">Cash déclaré</Text>
                          <Text className="text-sm text-slate-900 font-quicksand-bold">
                            {settlement.cashAmount?.toLocaleString() || 0} Ar
                          </Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-slate-600 font-quicksand">
                            Mobile Money déclaré
                          </Text>
                          <Text className="text-sm text-slate-900 font-quicksand-bold">
                            {settlement.mobileMoneyAmount?.toLocaleString() || 0} Ar
                          </Text>
                        </View>
                        <View className="h-px bg-slate-200 my-2" />
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-slate-900 font-quicksand-semibold">
                            Total déclaré
                          </Text>
                          <Text className="text-base text-emerald-600 font-quicksand-bold">
                            {((settlement.cashAmount || 0) + (settlement.mobileMoneyAmount || 0)).toLocaleString()} Ar
                          </Text>
                        </View>
                      </View>

                      {settlement.declaredAt && (
                        <Text className="text-xs text-slate-500 font-quicksand mb-3">
                          Déclaré le {new Date(settlement.declaredAt).toLocaleString('fr-FR')}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={() => handleConfirm(settlement.id, settlement.courierName)}
                        disabled={confirming === settlement.id}
                        className={`rounded-xl py-3 items-center ${
                          confirming === settlement.id ? 'bg-slate-300' : 'bg-emerald-600'
                        }`}
                        activeOpacity={0.7}
                      >
                        {confirming === settlement.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text className="text-white font-quicksand-bold ml-2">
                              Confirmer le règlement
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Confirmés */}
            {confirmedSettlements.length > 0 && (
              <View>
                <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
                  CONFIRMÉS
                </Text>
                <View className="gap-3">
                  {confirmedSettlements.map((settlement) => (
                    <View
                      key={settlement.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200"
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-base font-quicksand-bold text-slate-900">
                            {settlement.courierName}
                          </Text>
                          <Text className="text-sm text-slate-600 font-quicksand mt-0.5">
                            {new Date(settlement.date).toLocaleDateString('fr-FR')}
                          </Text>
                        </View>
                        <View className="bg-green-100 px-3 py-1 rounded-lg">
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={14} color="#059669" />
                            <Text className="text-xs font-quicksand-semibold text-green-700 ml-1">
                              CONFIRMÉ
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="bg-slate-50 rounded-xl p-3">
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-slate-600 font-quicksand">Cash</Text>
                          <Text className="text-sm text-slate-900 font-quicksand-bold">
                            {settlement.cashAmount?.toLocaleString() || 0} Ar
                          </Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-sm text-slate-600 font-quicksand">
                            Mobile Money
                          </Text>
                          <Text className="text-sm text-slate-900 font-quicksand-bold">
                            {settlement.mobileMoneyAmount?.toLocaleString() || 0} Ar
                          </Text>
                        </View>
                        <View className="h-px bg-slate-200 my-2" />
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-slate-900 font-quicksand-semibold">
                            Total
                          </Text>
                          <Text className="text-base text-emerald-600 font-quicksand-bold">
                            {((settlement.cashAmount || 0) + (settlement.mobileMoneyAmount || 0)).toLocaleString()} Ar
                          </Text>
                        </View>
                      </View>

                      {settlement.confirmedAt && (
                        <Text className="text-xs text-slate-500 font-quicksand mt-3">
                          Confirmé le {new Date(settlement.confirmedAt).toLocaleString('fr-FR')}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
