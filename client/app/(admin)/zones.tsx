import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import type { Zone } from '@/lib/api/models/Zone';
import type { Axis } from '@/lib/api/models/Axis';
import type { Locality } from '@/lib/api/models/Locality';

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
  const [axes, setAxes] = useState<Record<number, Axis[]>>({});
  const [localities, setLocalities] = useState<Record<number, Locality[]>>({});

  const [newAxisLabel, setNewAxisLabel] = useState('');
  const [newAxisKey, setNewAxisKey] = useState<'nord'|'est'|'sud'|'ouest'|'nord_ouest'|'sud_ouest'>('nord');
  const [creatingAxisForZoneId, setCreatingAxisForZoneId] = useState<number | null>(null);
  const [deletingAxisId, setDeletingAxisId] = useState<number | null>(null);

  const [newLocalityName, setNewLocalityName] = useState('');
  const [creatingLocalityForAxisId, setCreatingLocalityForAxisId] = useState<number | null>(null);
  const [deletingLocalityId, setDeletingLocalityId] = useState<number | null>(null);

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
    try {
      const a = await api.adminZones.getApiAdminZonesAxes(zoneId);
      setAxes(prev => ({ ...prev, [zoneId]: a }));
    } catch (e) {
      console.warn('load axes error', e);
      showToast('Chargement axes échoué', 'error');
    }
  };

  const createAxis = async (zoneId: number) => {
    try {
      setCreatingAxisForZoneId(zoneId);
      await api.adminZones.postApiAdminZonesAxes(zoneId, { key: newAxisKey, label: newAxisLabel });
      showToast('Axe créé', 'success');
      setNewAxisLabel('');
      const a = await api.adminZones.getApiAdminZonesAxes(zoneId);
      setAxes(prev => ({ ...prev, [zoneId]: a }));
    } catch (e) {
      console.warn('create axis error', e);
      showToast("Création axe échouée", 'error');
    } finally {
      setCreatingAxisForZoneId(null);
    }
  };

  const updateAxis = async (axisId: number, label: string, zoneId: number) => {
    try {
      await api.adminZones.putApiAdminZonesAxes(axisId, { label });
      showToast('Axe mis à jour', 'success');
      const a = await api.adminZones.getApiAdminZonesAxes(zoneId);
      setAxes(prev => ({ ...prev, [zoneId]: a }));
    } catch (e) {
      console.warn('update axis error', e);
      showToast('MàJ axe échouée', 'error');
    }
  };

  const deleteAxis = async (axisId: number, zoneId: number) => {
    try {
      setDeletingAxisId(axisId);
      await api.adminZones.deleteApiAdminZonesAxes(axisId);
      showToast('Axe supprimé', 'success');
      const a = await api.adminZones.getApiAdminZonesAxes(zoneId);
      setAxes(prev => ({ ...prev, [zoneId]: a }));
    } catch (e) {
      console.warn('delete axis error', e);
      showToast('Suppression axe échouée', 'error');
    } finally {
      setDeletingAxisId(null);
    }
  };
  const confirmDeleteAxis = (axisId: number, zoneId: number) => {
    Alert.alert('Supprimer l\'axe', 'Cette action est irréversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteAxis(axisId, zoneId) },
    ]);
  };

  const loadLocalities = async (axisId: number) => {
    try {
      const l = await api.adminZones.getApiAdminZonesAxesLocalities(axisId);
      setLocalities(prev => ({ ...prev, [axisId]: l }));
    } catch (e) {
      console.warn('load localities error', e);
      showToast('Chargement localités échoué', 'error');
    }
  };

  const createLocality = async (axisId: number) => {
    try {
      setCreatingLocalityForAxisId(axisId);
      await api.adminZones.postApiAdminZonesAxesLocalities(axisId, { name: newLocalityName });
      showToast('Localité créée', 'success');
      setNewLocalityName('');
      await loadLocalities(axisId);
    } catch (e) {
      console.warn('create locality error', e);
      showToast('Création localité échouée', 'error');
    } finally {
      setCreatingLocalityForAxisId(null);
    }
  };

  const updateLocality = async (localityId: number, name: string, axisId: number) => {
    try {
      await api.adminZones.putApiAdminZonesLocalities(localityId, { name });
      showToast('Localité mise à jour', 'success');
      await loadLocalities(axisId);
    } catch (e) {
      console.warn('update locality error', e);
      showToast('MàJ localité échouée', 'error');
    }
  };

  const deleteLocality = async (localityId: number, axisId: number) => {
    try {
      setDeletingLocalityId(localityId);
      await api.adminZones.deleteApiAdminZonesLocalities(localityId);
      showToast('Localité supprimée', 'success');
      await loadLocalities(axisId);
    } catch (e) {
      console.warn('delete locality error', e);
      showToast('Suppression localité échouée', 'error');
    } finally {
      setDeletingLocalityId(null);
    }
  };
  const confirmDeleteLocality = (localityId: number, axisId: number) => {
    Alert.alert('Supprimer la localité', 'Cette action est irréversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteLocality(localityId, axisId) },
    ]);
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
              <Text className="text-slate-600 mb-1">Renommer la zone</Text>
              <View className="flex-row gap-2 mb-3">
                <TextInput className="flex-1 border border-slate-300 rounded px-3 py-2" defaultValue={z.label || ''} onEndEditing={(e) => updateZone(z.id!, e.nativeEvent.text)} />
                <TouchableOpacity className="px-3 py-2 rounded border border-red-600" onPress={() => confirmDeleteZone(z.id!)}>
                  <Text className="text-red-600">Supprimer</Text>
                </TouchableOpacity>
              </View>

              <Text className="font-quicksand-bold mt-2 mb-2">Axes</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-3">
                <Text className="text-slate-600 mb-1">Créer un axe</Text>
                <View className="flex-row gap-2 mb-2 flex-wrap">
                  {(['nord','est','sud','ouest','nord_ouest','sud_ouest'] as const).map(k => (
                    <TouchableOpacity key={k} className={`px-3 py-2 rounded border ${newAxisKey===k?'bg-emerald-600 border-emerald-600':'border-slate-300'}`} onPress={() => setNewAxisKey(k)}>
                      <Text className={newAxisKey===k? 'text-white' : 'text-slate-700'}>{k}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput className="border border-slate-300 rounded px-3 py-2 mb-2" placeholder="Label" value={newAxisLabel} onChangeText={setNewAxisLabel} />
                <TouchableOpacity className={`rounded ${creatingAxisForZoneId===z.id ? 'bg-emerald-400' : 'bg-emerald-600'}`} disabled={creatingAxisForZoneId===z.id} onPress={() => createAxis(z.id!)}>
                  <Text className="text-white text-center py-3">{creatingAxisForZoneId===z.id ? 'Création…' : "Créer l'axe"}</Text>
                </TouchableOpacity>
              </View>

              {(axes[z.id!] || []).map(a => (
                <View key={a.id} className="border border-slate-200 rounded-md p-3 mb-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-quicksand-bold">Axe: {a.key} — {a.label}</Text>
                    <TouchableOpacity disabled={deletingAxisId===a.id} onPress={() => confirmDeleteAxis(a.id!, z.id!)}>
                      <Text className={`text-red-600 ${deletingAxisId===a.id ? 'opacity-50' : ''}`}>{deletingAxisId===a.id ? 'Suppression…' : 'Supprimer'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput className="border border-slate-300 rounded px-3 py-2 mb-2" defaultValue={a.label || ''} onEndEditing={(e) => updateAxis(a.id!, e.nativeEvent.text, z.id!)} />

                  <Text className="font-quicksand-bold mt-2 mb-1">Localités</Text>
                  <View className="bg-slate-50 border border-slate-200 rounded-md p-3">
                    <View className="flex-row gap-2 mb-2">
                      <TextInput className="flex-1 border border-slate-300 rounded px-3 py-2" placeholder="Nom de localité" value={newLocalityName} onChangeText={setNewLocalityName} />
                      <TouchableOpacity className={`px-3 py-2 rounded ${creatingLocalityForAxisId===a.id ? 'bg-emerald-400' : 'bg-emerald-600'}`} disabled={creatingLocalityForAxisId===a.id} onPress={() => createLocality(a.id!)}>
                        <Text className="text-white">{creatingLocalityForAxisId===a.id ? 'Ajout…' : 'Ajouter'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity className="mb-2" onPress={() => loadLocalities(a.id!)}>
                      <Text className="text-emerald-700">Rafraîchir</Text>
                    </TouchableOpacity>
                    {(localities[a.id!] || []).map(l => (
                      <View key={l.id} className="flex-row items-center justify-between py-1">
                        <Text>{l.name}</Text>
                        <View className="flex-row gap-3">
                          <TouchableOpacity onPress={() => updateLocality(l.id!, l.name || '', a.id!)}>
                            <Text className="text-emerald-700">Sauver</Text>
                          </TouchableOpacity>
                          <TouchableOpacity disabled={deletingLocalityId===l.id} onPress={() => confirmDeleteLocality(l.id!, a.id!)}>
                            <Text className={`text-red-600 ${deletingLocalityId===l.id ? 'opacity-50' : ''}`}>{deletingLocalityId===l.id ? 'Suppression…' : 'Supprimer'}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
