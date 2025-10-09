import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import type { Zone } from '@/lib/api/models/Zone';

export default function AdminZonesPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingZone, setCreatingZone] = useState(false);
  const [deletingZoneId, setDeletingZoneId] = useState<number | null>(null);

  // Create inputs
  const [newZoneKey, setNewZoneKey] = useState<'ville'|'peripherie'|'super-peripherie'>('ville');
  const [newZoneLabel, setNewZoneLabel] = useState('');

  const [expandedZoneId, setExpandedZoneId] = useState<number | null>(null);

  // Geometry editor state (per zone)
  const [geometryTextByZoneId, setGeometryTextByZoneId] = useState<Record<number, string>>({});
  const [geometryBusyByZoneId, setGeometryBusyByZoneId] = useState<Record<number, boolean>>({});
  

  const loadZones = async () => {
    setLoading(true);
    try {
      const z = await api.adminZones.getApiAdminZones();
      setZones(z);
    } catch (e) {
      console.warn('load zones error', e);
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
      console.warn('create zone error', e);
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
      console.warn('update zone error', e);
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
      console.warn('delete zone error', e);
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
    if (expandedZoneId === zoneId) { setExpandedZoneId(null); return; }
    setExpandedZoneId(zoneId);
    const z = zones.find(zz => zz.id === zoneId);
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
      console.warn('load geometry error', e);
      showToast('Chargement géométrie échoué', 'error');
    } finally {
      setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: false }));
    }
  };

  const saveGeometry = async (z: Zone) => {
    if (!z?.id || !z?.key) return;
    const raw = geometryTextByZoneId[z.id!]?.trim();
    if (!raw) { showToast('Collez un GeoJSON valide', 'error'); return; }
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
      // Save by key for convenience
      await api.adminZones.putApiAdminZonesKeyGeometry(z.key as any, { geometry: parsed });
      showToast('Géométrie enregistrée', 'success');
    } catch (e) {
      console.warn('save geometry error', e);
      showToast('Enregistrement géométrie échoué', 'error');
    } finally {
      setGeometryBusyByZoneId((m) => ({ ...m, [z.id!]: false }));
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-quicksand-bold mb-4">Zones</Text>

      <View className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6">
        <Text className="font-quicksand-bold mb-2">Créer une zone</Text>
        <Text className="text-slate-600 mb-1">Clé</Text>
        <View className="flex-row gap-2 mb-2">
          {(['ville','peripherie','super-peripherie'] as const).map(k => (
            <TouchableOpacity
              key={k}
              className={`px-3 py-2 rounded border ${newZoneKey===k?'bg-emerald-600 border-emerald-600':'border-slate-300'}`}
              onPress={() => setNewZoneKey(k)}
            >
              <Text className={newZoneKey===k? 'text-white' : 'text-slate-700'}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput className="border border-slate-300 rounded px-3 py-2 mb-3" placeholder="Label" value={newZoneLabel} onChangeText={setNewZoneLabel} />
        <TouchableOpacity className={`rounded ${creatingZone ? 'bg-emerald-400' : 'bg-emerald-600'}`} disabled={creatingZone} onPress={() => createZone()}>
          <Text className="text-white text-center py-3">{creatingZone ? 'Création…' : 'Créer'}</Text>
        </TouchableOpacity>
      </View>

      {(zones || []).map(z => (
        <View key={z.id} className="border border-slate-200 rounded-md mb-4">
          <TouchableOpacity className="px-4 py-3 bg-slate-50" onPress={() => toggleZone(z.id!)}>
            <Text className="font-quicksand-bold">Zone: {z.key} — {z.label}</Text>
          </TouchableOpacity>
          {expandedZoneId === z.id && (
            <View className="p-4">
              <Text className="font-quicksand-bold mb-2">Geometry (GeoJSON)</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-3">
                <Text className="text-slate-600 mb-1">Collez un GeoJSON Polygon/MultiPolygon (coordonnées [lng, lat])</Text>
                <TextInput
                  className="border border-slate-300 rounded px-3 py-2"
                  style={{ minHeight: 140, textAlignVertical: 'top' }}
                  multiline
                  placeholder='Ex: { "type": "Polygon", "coordinates": [[[47.50,-18.95],[47.60,-18.95],[47.60,-18.85],[47.50,-18.85],[47.50,-18.95]]] }'
                  value={geometryTextByZoneId[z.id!] ?? ''}
                  onChangeText={(t) => setGeometryTextByZoneId((m) => ({ ...m, [z.id!]: t }))}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View className="flex-row gap-2 mt-2">
                  <TouchableOpacity onPress={() => loadGeometry(z)} disabled={!!geometryBusyByZoneId[z.id!]} className={`px-3 py-2 rounded ${geometryBusyByZoneId[z.id!] ? 'bg-slate-300' : 'bg-slate-200'}`}>
                    <Text className="text-slate-700 text-xs font-quicksand-bold">{geometryBusyByZoneId[z.id!] ? 'Chargement…' : 'Charger'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => saveGeometry(z)} disabled={!!geometryBusyByZoneId[z.id!]} className={`px-3 py-2 rounded ${geometryBusyByZoneId[z.id!] ? 'bg-emerald-400' : 'bg-emerald-600'}`}>
                    <Text className="text-white text-xs font-quicksand-bold">{geometryBusyByZoneId[z.id!] ? 'Enregistrement…' : 'Enregistrer'}</Text>
                  </TouchableOpacity>
                  <View className="flex-1" />
                  <TouchableOpacity className="px-3 py-2 rounded border border-red-600" onPress={() => confirmDeleteZone(z.id!)}>
                    <Text className="text-red-600">Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-slate-600 mb-1">Renommer la zone</Text>
              <View className="flex-row gap-2 mb-3">
                <TextInput className="flex-1 border border-slate-300 rounded px-3 py-2" defaultValue={z.label || ''} onEndEditing={(e) => updateZone(z.id!, e.nativeEvent.text)} />
                <TouchableOpacity className="px-3 py-2 rounded border border-red-600" onPress={() => confirmDeleteZone(z.id!)}>
                  <Text className="text-red-600">Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
