import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useAdminGps } from '../../lib/hooks/useAdminGps';

// Initialiser Mapbox
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

const { width, height } = Dimensions.get('window');
const DEFAULT_CENTER: [number, number] = [47.5079, -18.8792]; // Antananarivo [lng, lat]

export default function AdminGpsTrackingScreen() {
  const { couriers, loading, fetchCouriers } = useAdminGps();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoomLevel, setZoomLevel] = useState(10);

  useEffect(() => {
    fetchCouriers();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(() => {
      fetchCouriers();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchCouriers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCouriers();
    setRefreshing(false);
  };

  const activeCouriers = couriers.filter(
    (c) => c.gpsEnabled && c.lastGpsLat && c.lastGpsLng
  );

  // Centrer la carte sur le livreur sélectionné
  useEffect(() => {
    if (selectedCourier) {
      const courier = activeCouriers.find(c => c.id === selectedCourier);
      if (courier && courier.lastGpsLng && courier.lastGpsLat) {
        const newCenter: [number, number] = [courier.lastGpsLng, courier.lastGpsLat];
        setMapCenter(newCenter);
        setZoomLevel(14);
      }
    }
  }, [selectedCourier, activeCouriers]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-quicksand-bold text-slate-900">Suivi GPS</Text>
            <Text className="text-sm text-slate-600 font-quicksand mt-1">
              {activeCouriers.length} livreur(s) actif(s)
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-blue-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <View className="flex-1">
          {/* Carte Mapbox */}
          <View style={{ height: height * 0.5 }}>
            <Mapbox.MapView
              style={{ flex: 1 }}
              onCameraChanged={(state) => {
                setMapCenter(state.properties.center as [number, number]);
                setZoomLevel(state.properties.zoom);
              }}
            >
              <Mapbox.Camera
                centerCoordinate={mapCenter}
                zoomLevel={zoomLevel}
                animationMode="flyTo"
                animationDuration={500}
              />
              
              <Mapbox.UserLocation />
              
              {activeCouriers.map((courier) => (
                <Mapbox.PointAnnotation
                  key={courier.id}
                  id={`courier-${courier.id}`}
                  coordinate={[courier.lastGpsLng!, courier.lastGpsLat!]}
                  onSelected={() => setSelectedCourier(courier.id)}
                >
                  <View className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg">
                    <Ionicons name="bicycle" size={20} color="#fff" />
                  </View>
                  <Mapbox.Callout title={courier.name}>
                    <View className="p-2">
                      <Text className="text-sm font-semibold">{courier.name}</Text>
                      <Text className="text-xs text-gray-600">
                        Dernière position: {courier.lastGpsAt
                          ? new Date(courier.lastGpsAt).toLocaleTimeString('fr-FR')
                          : 'Inconnue'}
                      </Text>
                    </View>
                  </Mapbox.Callout>
                </Mapbox.PointAnnotation>
              ))}
              
              {/* Lignes de trajectoire (optionnel) */}
              {activeCouriers.length > 0 && (
                <Mapbox.ShapeSource
                  id="couriers-source"
                  shape={{
                    type: 'FeatureCollection',
                    features: activeCouriers.map(courier => ({
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [courier.lastGpsLng!, courier.lastGpsLat!],
                      },
                      properties: {
                        id: courier.id,
                        name: courier.name,
                      },
                    })),
                  }}
                >
                  <Mapbox.CircleLayer
                    id="couriers-circles"
                    style={{
                      circleRadius: 8,
                      circleColor: '#2563EB',
                      circleStrokeWidth: 2,
                      circleStrokeColor: '#FFFFFF',
                    }}
                  />
                </Mapbox.ShapeSource>
              )}
            </Mapbox.MapView>
          </View>

          {/* Liste des livreurs */}
          <ScrollView
            className="flex-1 bg-white"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <View className="p-4">
              <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
                LIVREURS ACTIFS
              </Text>

              {activeCouriers.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="navigate-outline" size={48} color="#CBD5E1" />
                  <Text className="text-slate-500 font-quicksand mt-2">
                    Aucun livreur avec GPS actif
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {activeCouriers.map((courier) => (
                    <TouchableOpacity
                      key={courier.id}
                      onPress={() => setSelectedCourier(courier.id)}
                      className={`rounded-2xl p-4 border-2 ${
                        selectedCourier === courier.id
                          ? 'bg-blue-50 border-blue-600'
                          : 'bg-white border-slate-200'
                      }`}
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
                        <View className="bg-green-100 px-2 py-1 rounded-lg">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                            <Text className="text-xs font-quicksand-semibold text-green-700">
                              En ligne
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="bg-slate-50 rounded-xl p-3 mt-2">
                        <View className="flex-row items-center mb-2">
                          <Ionicons name="location" size={14} color="#64748B" />
                          <Text className="text-xs text-slate-600 font-quicksand ml-1">
                            Position
                          </Text>
                        </View>
                        <Text className="text-sm text-slate-900 font-quicksand">
                          Lat: {courier.lastGpsLat?.toFixed(6)}
                        </Text>
                        <Text className="text-sm text-slate-900 font-quicksand">
                          Lng: {courier.lastGpsLng?.toFixed(6)}
                        </Text>
                        <Text className="text-xs text-slate-500 font-quicksand mt-2">
                          Mis à jour: {courier.lastGpsAt
                            ? new Date(courier.lastGpsAt).toLocaleString('fr-FR')
                            : 'Inconnu'}
                        </Text>
                      </View>

                      {courier.stats && (
                        <View className="flex-row gap-2 mt-3">
                          <View className="flex-1 bg-amber-50 rounded-lg p-2">
                            <Text className="text-xs text-amber-600 font-quicksand">En cours</Text>
                            <Text className="text-lg text-amber-900 font-quicksand-bold">
                              {courier.stats.pendingOrders}
                            </Text>
                          </View>
                          <View className="flex-1 bg-green-50 rounded-lg p-2">
                            <Text className="text-xs text-green-600 font-quicksand">Livrées</Text>
                            <Text className="text-lg text-green-900 font-quicksand-bold">
                              {courier.stats.deliveredOrders}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Livreurs inactifs */}
              {couriers.filter((c) => !c.gpsEnabled || !c.lastGpsLat).length > 0 && (
                <View className="mt-6">
                  <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
                    LIVREURS INACTIFS
                  </Text>
                  <View className="gap-2">
                    {couriers
                      .filter((c) => !c.gpsEnabled || !c.lastGpsLat)
                      .map((courier) => (
                        <View
                          key={courier.id}
                          className="bg-slate-100 rounded-xl p-3 flex-row items-center justify-between"
                        >
                          <View className="flex-1">
                            <Text className="text-sm font-quicksand-semibold text-slate-900">
                              {courier.name}
                            </Text>
                            <Text className="text-xs text-slate-600 font-quicksand mt-0.5">
                              {!courier.gpsEnabled ? 'GPS désactivé' : 'Aucune position'}
                            </Text>
                          </View>
                          <Ionicons name="navigate-outline" size={20} color="#94A3B8" />
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
