import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';
import type { Zone } from '../../lib/api/models/Zone';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Plus, ChevronDown, ChevronUp, Save, Trash2, Loader } from 'lucide-react-native';

export default function AdminZonesPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingZone, setCreatingZone] = useState(false);
  const [deletingZoneId, setDeletingZoneId] = useState<number | null>(null);

  const [newZoneKey, setNewZoneKey] = useState<'ville' | 'peripherie' | 'super-peripherie'>('ville');
  const [newZoneLabel, setNewZoneLabel] = useState('');

  const [expandedZoneId, setExpandedZoneId] = useState<number | null>(null);

  const [geometryTextByZoneId, setGeometryTextByZoneId] = useState<Record<number, string>>({});
  const [geometryBusyByZoneId, setGeometryBusyByZoneId] = useState<Record<number, boolean>>({});

  const loadZones = async () => {
    setLoading(true);
    try {
      const z = await api.adminZones.getApiAdminZones();
      setZones(z);
    } catch (e) {
      
      showToast('Chargement zones échoué', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const createZone = async () => {
    try {
      setCreatingZone(true);
      await api.adminZones.postApiAdminZones({ key: newZoneKey, label: newZoneLabel });
      showToast('Zone créée', 'success');
      setNewZoneLabel('');
      await loadZones();
    } catch (e) {
      
      showToast('Création zone échouée', 'error');
    } finally {
      setCreatingZone(false);
    }
  };

  const updateZone = async (id: number, label: string) => {
    try {
      await api.adminZones.putApiAdminZones(id, { label });
      showToast('Zone mise à jour', 'success');
      await loadZones();
    } catch (e) {
      
      showToast('MàJ zone échouée', 'error');
    }
  };

  const deleteZone = async (id: number) => {
    try {
      setDeletingZoneId(id);
      await api.adminZones.deleteApiAdminZones(id);
      showToast('Zone supprimée', 'success');
      await loadZones();
    } catch (e) {
      
      showToast('Suppression zone échouée', 'error');
    } finally {
      setDeletingZoneId(null);
    }
  };

  const confirmDeleteZone = (id: number) => {
    Alert.alert('Supprimer la zone', 'Cette action est irréversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteZone(id) },
    ]);
  };

  const toggleZone = async (zoneId: number) => {
    if (expandedZoneId === zoneId) {
      setExpandedZoneId(null);
      return;
    }
    setExpandedZoneId(zoneId);
    const z = zones.find((zz) => zz.id === zoneId);
    if (z) {
      await loadGeometry(z);
    }
  };

  const loadGeometry = async (z: Zone) => {
    if (!z?.id) return;
    setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: true }));
    try {
      const res = await api.adminZones.getApiAdminZonesGeometry(z.id!);
      const text = res?.geometry ? JSON.stringify(res.geometry, null, 2) : '';
      setGeometryTextByZoneId((m) => ({ ...m, [z.id!]: text }));
      showToast('Géométrie chargée', 'success');
    } catch (e) {
      
      showToast('Chargement géométrie échoué', 'error');
    } finally {
      setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: false }));
    }
  };

  const saveGeometry = async (z: Zone) => {
    if (!z?.id || !z?.key) return;
    const raw = geometryTextByZoneId[z.id!]?.trim();
    if (!raw) {
      showToast('Collez un GeoJSON valide', 'error');
      return;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      showToast('JSON invalide', 'error');
      return;
    }
    const t = parsed?.type;
    if (!(t === 'Polygon' || t === 'MultiPolygon') || !Array.isArray(parsed?.coordinates)) {
      showToast('GeoJSON invalide (Polygon ou MultiPolygon requis)', 'error');
      return;
    }
    setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: true }));
    try {
      await api.adminZones.putApiAdminZonesKeyGeometry(z.key as any, { geometry: parsed });
      showToast('Géométrie enregistrée', 'success');
    } catch (e) {
      
      showToast('Enregistrement géométrie échoué', 'error');
    } finally {
      setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: false }));
    }
  };

  const keyLabels: Record<string, string> = {
    ville: 'Ville',
    peripherie: 'Périphérie',
    'super-peripherie': 'Super-périphérie',
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-6 px-6"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-clash-bold mb-1">Zones</Text>
            <Text className="text-emerald-100 text-sm font-quicksand">
              Gestion des zones de livraison
            </Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <MapPin size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {/* Créer une zone */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-emerald-100 rounded-lg p-2">
                <Plus size={20} color="#059669" strokeWidth={2.5} />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-lg">Créer une zone</Text>
            </View>
            <View>
              <View className="mb-4">
                <Text className="text-gray-700 text-sm font-quicksand-semibold mb-2">Clé</Text>
                <View className="flex-row gap-2">
                  {(['ville', 'peripherie', 'super-peripherie'] as const).map((k) => (
                    <TouchableOpacity
                      key={k}
                      className="flex-1 rounded-xl overflow-hidden"
                      onPress={() => setNewZoneKey(k)}
                      activeOpacity={0.7}
                    >
                      {newZoneKey === k ? (
                        <LinearGradient colors={['#059669', '#047857']} className="py-3 items-center">
                          <Text className="text-white font-quicksand-semibold text-sm">{keyLabels[k]}</Text>
                        </LinearGradient>
                      ) : (
                        <View className="py-3 items-center bg-gray-50 border border-gray-200">
                          <Text className="text-gray-600 font-quicksand-semibold text-sm">{keyLabels[k]}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
                placeholder="Label de la zone"
                value={newZoneLabel}
                onChangeText={setNewZoneLabel}
              />
              <TouchableOpacity
                className={`rounded-xl overflow-hidden ${creatingZone ? 'opacity-50' : ''}`}
                disabled={creatingZone}
                onPress={createZone}
                activeOpacity={0.7}
              >
                <LinearGradient colors={['#059669', '#047857']} className="py-4">
                  <Text className="text-white text-center font-quicksand-bold">
                    {creatingZone ? 'Création…' : 'Créer la zone'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Liste des zones */}
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : (
            <View>
              {(zones || []).map((z, idx) => {
                const isExpanded = expandedZoneId === z.id;
                const geometryBusy = !!geometryBusyByZoneId[z.id!];
                return (
                  <View key={z.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${idx < zones.length - 1 ? 'mb-4' : ''}`}>
                    <TouchableOpacity
                      className="px-5 py-4 flex-row items-center justify-between"
                      onPress={() => toggleZone(z.id!)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <MapPin size={18} color="#059669" />
                          <Text className="text-gray-900 font-quicksand-bold text-base">{z.label}</Text>
                        </View>
                        <Text className="text-gray-500 text-sm font-quicksand">{z.key}</Text>
                      </View>
                      {isExpanded ? (
                        <ChevronUp size={20} color="#64748B" />
                      ) : (
                        <ChevronDown size={20} color="#64748B" />
                      )}
                    </TouchableOpacity>
                    {isExpanded && (
                      <View className="px-5 pb-5 border-t border-gray-100">
                        {/* Géométrie */}
                        <View className="mt-4">
                          <Text className="text-gray-900 font-quicksand-bold mb-2">Géométrie (GeoJSON)</Text>
                          <View className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
                            <Text className="text-gray-600 text-xs font-quicksand mb-2">
                              Collez un GeoJSON Polygon/MultiPolygon (coordonnées [lng, lat])
                            </Text>
                            <TextInput
                              className="border border-gray-200 rounded-xl px-4 py-3 bg-white font-quicksand"
                              style={{ minHeight: 140, textAlignVertical: 'top' }}
                              multiline
                              placeholder='Ex: { "type": "Polygon", "coordinates": [[[47.50,-18.95],[47.60,-18.95],[47.60,-18.85],[47.50,-18.85],[47.50,-18.95]]] }'
                              value={geometryTextByZoneId[z.id!] ?? ''}
                              onChangeText={(t) => setGeometryTextByZoneId((m) => ({ ...m, [z.id!]: t }))}
                              autoCapitalize="none"
                              autoCorrect={false}
                            />
                            <View className="flex-row gap-2 mt-3">
                              <TouchableOpacity
                                onPress={() => loadGeometry(z)}
                                disabled={geometryBusy}
                                className={`flex-1 rounded-xl overflow-hidden ${geometryBusy ? 'opacity-50' : ''}`}
                                activeOpacity={0.7}
                              >
                                <View className="bg-gray-100 py-3 items-center">
                                  {geometryBusy ? (
                                    <ActivityIndicator size="small" color="#64748B" />
                                  ) : (
                                    <View className="flex-row items-center gap-2">
                                      <Loader size={16} color="#64748B" />
                                      <Text className="text-gray-700 text-sm font-quicksand-bold">Charger</Text>
                                    </View>
                                  )}
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => saveGeometry(z)}
                                disabled={geometryBusy}
                                className={`flex-1 rounded-xl overflow-hidden ${geometryBusy ? 'opacity-50' : ''}`}
                                activeOpacity={0.7}
                              >
                                <LinearGradient colors={['#059669', '#047857']} className="py-3 items-center">
                                  {geometryBusy ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                  ) : (
                                    <View className="flex-row items-center gap-2">
                                      <Save size={16} color="#fff" />
                                      <Text className="text-white text-sm font-quicksand-bold">Enregistrer</Text>
                                    </View>
                                  )}
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>

                        {/* Renommer */}
                        <View className="mt-4">
                          <Text className="text-gray-700 text-sm font-quicksand-semibold mb-2">Renommer la zone</Text>
                          <View className="flex-row gap-2">
                            <TextInput
                              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
                              defaultValue={z.label || ''}
                              onEndEditing={(e) => updateZone(z.id!, e.nativeEvent.text)}
                              placeholder="Nouveau nom"
                            />
                            <TouchableOpacity
                              className="rounded-xl overflow-hidden"
                              onPress={() => confirmDeleteZone(z.id!)}
                              activeOpacity={0.7}
                            >
                              <LinearGradient colors={['#EF4444', '#DC2626']} className="px-4 py-3">
                                <View className="flex-row items-center gap-2">
                                  <Trash2 size={16} color="#fff" />
                                  <Text className="text-white font-quicksand-bold text-sm">Supprimer</Text>
                                </View>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
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
