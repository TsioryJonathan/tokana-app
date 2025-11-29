import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, RefreshCw } from 'lucide-react-native';
import { useAdminGps } from './hooks/useAdminGps';

function formatLastSeen(iso?: string | null): string {
  if (!iso) return 'Jamais';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || 'Inconnu';
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  return d.toLocaleString('fr-FR');
}

function formatCoords(lat?: number | null, lng?: number | null): string {
  if (lat == null || lng == null) return 'Aucune position reçue';
  const latFixed = lat.toFixed(5);
  const lngFixed = lng.toFixed(5);
  return `${latFixed}, ${lngFixed}`;
}

export default function AdminGpsScreen() {
  const router = useRouter();
  const {
    couriers,
    loading,
    error,
    onlyActive,
    setOnlyActive,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    updatingId,
    load,
    toggleTracking,
  } = useAdminGps();

  const hasCouriers = couriers.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Suivi GPS des livreurs</Text>
          <Text className="text-gray-500 text-xs font-quicksand">
            Voir le statut de tracking et la dernière position connue.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => load()}
          className="ml-3 rounded-full bg-emerald-50 p-2"
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-3 pb-6">
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <MapPin size={18} color="#0F172A" />
                <Text className="text-gray-900 font-quicksand-semibold text-sm">Filtres</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 text-xs font-quicksand-semibold mb-1">
                  Afficher seulement les suivis actifs
                </Text>
                <Text className="text-gray-500 text-[11px] font-quicksand">
                  Ne montrer que les livreurs avec tracking activé.
                </Text>
              </View>
              <Switch
                value={onlyActive}
                onValueChange={setOnlyActive}
                trackColor={{ false: '#CBD5F5', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 text-xs font-quicksand-semibold mb-1">
                  Auto-refresh (1 min)
                </Text>
                <Text className="text-gray-500 text-[11px] font-quicksand">
                  Actualisation automatique de la liste toutes les 60 secondes.
                </Text>
              </View>
              <Switch
                value={autoRefreshEnabled}
                onValueChange={setAutoRefreshEnabled}
                trackColor={{ false: '#CBD5F5', true: '#10B981' }}
                thumbColor="#fff"
              />
            </View>
            {error && <Text className="mt-2 text-xs text-red-600 font-quicksand">{error}</Text>}
          </View>

          {loading && !hasCouriers && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          )}

          {!loading && !hasCouriers && !error && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <Text className="text-gray-500 text-sm font-quicksand">
                Aucun livreur trouvé pour le moment.
              </Text>
            </View>
          )}

          {hasCouriers && (
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-900 font-quicksand-bold text-sm">Livreurs</Text>
                <Text className="text-gray-400 text-xs font-quicksand">
                  {couriers.length} éléments
                </Text>
              </View>
              {couriers.map((c) => {
                const id = c.id ?? 0;
                const tracking = !!c.gpsTrackingEnabled;
                const hasLocation = c.gpsLastLat != null && c.gpsLastLng != null;
                return (
                  <View
                    key={id}
                    className="py-3 border-b border-gray-100 last:border-0"
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-900 font-quicksand-semibold text-sm">
                          {c.name || `Livreur #${id}`}
                        </Text>
                        <Text className="text-[11px] text-gray-500 font-quicksand">
                          {c.phone || 'Téléphone non renseigné'}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`px-3 py-1 rounded-full ${
                            tracking ? 'bg-emerald-50' : 'bg-gray-100'
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-quicksand-semibold ${
                              tracking ? 'text-emerald-700' : 'text-gray-500'
                            }`}
                          >
                            {tracking ? 'Tracking ON' : 'Tracking OFF'}
                          </Text>
                        </View>
                        <Switch
                          value={tracking}
                          onValueChange={(v) => toggleTracking(id, v)}
                          disabled={updatingId === id}
                          trackColor={{ false: '#CBD5F5', true: '#10B981' }}
                          thumbColor="#fff"
                        />
                      </View>
                    </View>
                    <View className="mt-1">
                      <Text className="text-[11px] text-gray-500 font-quicksand">
                        Position: {formatCoords(c.gpsLastLat ?? null, c.gpsLastLng ?? null)}
                      </Text>
                      <Text className="text-[11px] text-gray-400 font-quicksand mt-0.5">
                        Dernière mise à jour: {hasLocation ? formatLastSeen(c.gpsLastSeenAt ?? null) : 'Jamais'}
                      </Text>
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
