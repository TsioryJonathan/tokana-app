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
import { useAdminClients } from '../../../lib/hooks/useAdminClients';

export default function AdminClientsListScreen() {
  const router = useRouter();
  const { clients, loading, total, fetchClients } = useAdminClients();
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = () => {
    fetchClients(search, zoneFilter || undefined);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClients(search, zoneFilter || undefined);
    setRefreshing(false);
  };

  const zones = ['TANA-VILLE', 'PÉRIPHÉRIE', 'SUPER-PÉRIPHÉRIE'];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-quicksand-bold text-slate-900">
            Clients ({total})
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/clients/new')}
            className="bg-emerald-600 px-4 py-2 rounded-xl flex-row items-center"
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
            className="bg-emerald-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filtres par zone */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              setZoneFilter('');
              fetchClients(search, undefined);
            }}
            className={`px-3 py-1.5 rounded-full ${
              zoneFilter === '' ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-quicksand-semibold ${
                zoneFilter === '' ? 'text-white' : 'text-slate-700'
              }`}
            >
              Toutes
            </Text>
          </TouchableOpacity>
          {zones.map((zone) => (
            <TouchableOpacity
              key={zone}
              onPress={() => {
                setZoneFilter(zone);
                fetchClients(search, zone);
              }}
              className={`px-3 py-1.5 rounded-full ${
                zoneFilter === zone ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-quicksand-semibold ${
                  zoneFilter === zone ? 'text-white' : 'text-slate-700'
                }`}
              >
                {zone}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des clients */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && !refreshing ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : clients.length === 0 ? (
          <View className="py-12 items-center">
            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-500 font-quicksand mt-3">Aucun client trouvé</Text>
          </View>
        ) : (
          <View className="p-4 gap-3">
            {clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                onPress={() => router.push(`/(admin)/clients/${client.id}`)}
                className="bg-white rounded-2xl p-4 border border-slate-200"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-quicksand-bold text-slate-900">
                      {client.name}
                    </Text>
                    <Text className="text-sm text-slate-600 font-quicksand mt-0.5">
                      {client.email}
                    </Text>
                  </View>
                  {client.zone && (
                    <View className="bg-emerald-100 px-2 py-1 rounded-lg">
                      <Text className="text-xs font-quicksand-semibold text-emerald-700">
                        {client.zone}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center gap-4 mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={14} color="#64748B" />
                    <Text className="text-xs text-slate-600 font-quicksand ml-1">
                      {client.phone}
                    </Text>
                  </View>
                  {client.address && (
                    <View className="flex-row items-center flex-1">
                      <Ionicons name="location-outline" size={14} color="#64748B" />
                      <Text
                        className="text-xs text-slate-600 font-quicksand ml-1"
                        numberOfLines={1}
                      >
                        {client.address}
                      </Text>
                    </View>
                  )}
                </View>

                {client.notes && (
                  <View className="mt-2 bg-amber-50 p-2 rounded-lg">
                    <Text className="text-xs text-amber-800 font-quicksand" numberOfLines={2}>
                      📝 {client.notes}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
