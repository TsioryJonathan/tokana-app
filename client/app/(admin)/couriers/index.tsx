import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminCouriers } from '../../../lib/hooks/useAdminCouriers';

export default function AdminCouriersListScreen() {
  const router = useRouter();
  const { couriers, loading, total, fetchCouriers } = useAdminCouriers();
  const [search, setSearch] = useState('');
  const [gpsFilter, setGpsFilter] = useState<boolean | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCouriers();
  }, []);

  const handleSearch = () => {
    fetchCouriers(search, gpsFilter);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCouriers(search, gpsFilter);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-quicksand-bold text-slate-900">
            Livreurs ({total})
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/couriers/new')}
            className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text className="text-white font-quicksand-semibold ml-1">Nouveau</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-xl px-3 py-2">
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher par nom, email, téléphone..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 text-sm text-slate-900"
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-blue-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filtres GPS */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              setGpsFilter(undefined);
              fetchCouriers(search, undefined);
            }}
            className={`px-3 py-1.5 rounded-full ${
              gpsFilter === undefined ? 'bg-blue-600' : 'bg-slate-200'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-quicksand-semibold ${
                gpsFilter === undefined ? 'text-white' : 'text-slate-700'
              }`}
            >
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setGpsFilter(true);
              fetchCouriers(search, true);
            }}
            className={`px-3 py-1.5 rounded-full ${
              gpsFilter === true ? 'bg-blue-600' : 'bg-slate-200'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-quicksand-semibold ${
                gpsFilter === true ? 'text-white' : 'text-slate-700'
              }`}
            >
              GPS Activé
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setGpsFilter(false);
              fetchCouriers(search, false);
            }}
            className={`px-3 py-1.5 rounded-full ${
              gpsFilter === false ? 'bg-blue-600' : 'bg-slate-200'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-quicksand-semibold ${
                gpsFilter === false ? 'text-white' : 'text-slate-700'
              }`}
            >
              GPS Désactivé
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des livreurs */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && !refreshing ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : couriers.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="bicycle-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-500 font-quicksand mt-3">Aucun livreur trouvé</Text>
          </View>
        ) : (
          <View className="p-4 gap-3">
            {couriers.map((courier) => (
              <TouchableOpacity
                key={courier.id}
                onPress={() => router.push(`/(admin)/couriers/${courier.id}`)}
                className="bg-white rounded-2xl p-4 border border-slate-200"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-quicksand-bold text-slate-900">
                      {courier.name}
                    </Text>
                    <Text className="text-sm text-slate-600 font-quicksand mt-0.5">
                      {courier.email}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-lg ${
                      courier.gpsEnabled ? 'bg-green-100' : 'bg-slate-200'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="navigate"
                        size={12}
                        color={courier.gpsEnabled ? '#059669' : '#64748B'}
                      />
                      <Text
                        className={`text-xs font-quicksand-semibold ml-1 ${
                          courier.gpsEnabled ? 'text-green-700' : 'text-slate-600'
                        }`}
                      >
                        GPS
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center gap-4 mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={14} color="#64748B" />
                    <Text className="text-xs text-slate-600 font-quicksand ml-1">
                      {courier.phone}
                    </Text>
                  </View>
                  {courier.lastGpsAt && (
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text className="text-xs text-slate-600 font-quicksand ml-1">
                        {new Date(courier.lastGpsAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
