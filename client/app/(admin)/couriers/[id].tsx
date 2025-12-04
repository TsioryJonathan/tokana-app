import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminCouriers, AdminCourier } from '../../../lib/hooks/useAdminCouriers';

export default function AdminCourierDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourier, deleteCourier, toggleGps } = useAdminCouriers();
  const [courier, setCourier] = useState<AdminCourier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourier();
  }, [id]);

  const loadCourier = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getCourier(parseInt(id, 10));
    setCourier(data);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer le livreur "${courier?.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const success = await deleteCourier(parseInt(id, 10));
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleToggleGps = async (value: boolean) => {
    if (!id) return;
    const success = await toggleGps(parseInt(id, 10), value);
    if (success) {
      loadCourier();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!courier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-slate-700 font-quicksand-semibold mt-3">Livreur introuvable</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-quicksand-bold text-slate-900">Détail Livreur</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/couriers/edit/${id}` as any)}
            className="bg-blue-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Informations principales */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
            INFORMATIONS
          </Text>

          <View className="gap-3">
            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Nom</Text>
              <Text className="text-base text-slate-900 font-quicksand-semibold">
                {courier.name}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Email</Text>
              <Text className="text-base text-slate-900 font-quicksand">{courier.email}</Text>
            </View>

            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Téléphone</Text>
              <Text className="text-base text-slate-900 font-quicksand">{courier.phone}</Text>
            </View>
          </View>
        </View>

        {/* GPS */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">GPS</Text>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-900 font-quicksand">Tracking GPS</Text>
              <Switch
                value={courier.gpsEnabled}
                onValueChange={handleToggleGps}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>

            {courier.lastGpsLat && courier.lastGpsLng && (
              <View>
                <Text className="text-xs text-slate-500 font-quicksand mb-1">
                  Dernière position
                </Text>
                <View className="bg-slate-50 p-3 rounded-lg">
                  <Text className="text-sm text-slate-900 font-quicksand">
                    Lat: {courier.lastGpsLat.toFixed(6)}
                  </Text>
                  <Text className="text-sm text-slate-900 font-quicksand">
                    Lng: {courier.lastGpsLng.toFixed(6)}
                  </Text>
                  {courier.lastGpsAt && (
                    <Text className="text-xs text-slate-500 font-quicksand mt-1">
                      Mis à jour: {new Date(courier.lastGpsAt).toLocaleString('fr-FR')}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Performances */}
        {courier.stats && (
          <View className="bg-white rounded-2xl p-4 mb-3">
            <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
              PERFORMANCES
            </Text>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 font-quicksand">Total commandes</Text>
                <Text className="text-lg text-slate-900 font-quicksand-bold">
                  {courier.stats.totalOrders}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 font-quicksand">Livrées</Text>
                <Text className="text-lg text-green-600 font-quicksand-bold">
                  {courier.stats.deliveredOrders}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 font-quicksand">En cours</Text>
                <Text className="text-lg text-amber-600 font-quicksand-bold">
                  {courier.stats.pendingOrders}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-600 font-quicksand">Taux de réussite</Text>
                <Text className="text-lg text-blue-600 font-quicksand-bold">
                  {courier.stats.successRate}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Statut */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">STATUT</Text>

          <View className="flex-row items-center">
            <Ionicons
              name={courier.emailVerifiedAt ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={courier.emailVerifiedAt ? '#059669' : '#EF4444'}
            />
            <Text className="text-sm text-slate-900 font-quicksand ml-2">
              Email {courier.emailVerifiedAt ? 'vérifié' : 'non vérifié'}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">DATES</Text>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-600 font-quicksand">Créé le</Text>
              <Text className="text-sm text-slate-900 font-quicksand-semibold">
                {new Date(courier.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-600 font-quicksand">Modifié le</Text>
              <Text className="text-sm text-slate-900 font-quicksand-semibold">
                {new Date(courier.updatedAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
