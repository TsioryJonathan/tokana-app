import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/components/ui/Toast';
import AddressAutocomplete from '@/components/AddressAutocomplete';

type Addr = { id: string; label?: string | null; detail: string; mapboxAddress?: string | null; lat?: number | null; lng?: number | null };

export default function AddressesScreen() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Addr[]>([]);
  const [saving, setSaving] = useState(false);

  // Modal form state
  const [visible, setVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [detail, setDetail] = useState('');
  const [mapboxText, setMapboxText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const openCreate = () => {
    setEditId(null);
    setLabel('');
    setDetail('');
    setMapboxText('');
    setLat(null); setLng(null);
    setVisible(true);
  };
  const openEdit = (a: Addr) => {
    setEditId(a.id);
    setLabel(a.label || '');
    setDetail(a.detail);
    setMapboxText(a.mapboxAddress || '');
    setLat(a.lat ?? null); setLng(a.lng ?? null);
    setVisible(true);
  };
  const closeForm = () => {
    if (saving) return;
    setVisible(false);
  };

  const refresh = async () => {
    const data: any[] = await (api as any).addresses.getApiAddresses();
    const normalized = (Array.isArray(data) ? data : []).map((r) => ({ id: String(r.id), label: r.label, detail: r.detail, mapboxAddress: r.mapboxAddress ?? null, lat: r.lat != null ? Number(r.lat) : null, lng: r.lng != null ? Number(r.lng) : null }));
    setRows(normalized);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        showToast("Impossible de charger les adresses", 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  const onSubmit = async () => {
    if (!detail.trim()) {
      showToast('Le champ adresse exacte est requis', 'error');
      return;
    }
    if (!mapboxText.trim() || lat == null || lng == null) {
      showToast("Sélectionne un quartier (autocomplétion)", 'error');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await (api as any).addresses.putApiAddresses(Number(editId), { label: label || null, detail, mapboxAddress: mapboxText, lat, lng });
        showToast('Adresse mise à jour', 'success');
      } else {
        await (api as any).addresses.postApiAddresses({ label: label || null, detail, mapboxAddress: mapboxText, lat, lng });
        showToast('Adresse ajoutée', 'success');
      }
      await refresh();
      setVisible(false);
    } catch (e) {
      showToast("Impossible d'enregistrer l'adresse", 'error');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = (id: string) => {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await (api as any).addresses.deleteApiAddresses(Number(id));
            await refresh();
            showToast('Adresse supprimée', 'success');
          } catch (e) {
            showToast("Suppression impossible", 'error');
          }
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between">
        <Text className="text-xl font-quicksand-bold text-slate-800">Mes adresses</Text>
        <TouchableOpacity onPress={openCreate} className="px-3 py-2 rounded-full bg-yellow-400">
          <Text className="text-slate-900 font-quicksand-bold">Ajouter</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {rows.length === 0 ? (
            <Text className="text-slate-500">Aucune adresse pour le moment.</Text>
          ) : (
            rows.map((a) => (
              <View key={a.id} className="mb-3 p-3 rounded-xl border border-slate-200 bg-white">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-[12px] text-slate-400">{a.label || 'Adresse'}</Text>
                    <Text className="text-[14px] text-slate-700">{a.detail}</Text>
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => openEdit(a)} accessibilityLabel="Modifier">
                      <Ionicons name="create-outline" size={20} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(a.id)} accessibilityLabel="Supprimer">
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          <View className="h-4" />
        </ScrollView>
      )}

      {/* Modal form */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 bg-black/40 items-center justify-end">
          <View className="w-full bg-white rounded-t-3xl p-4">
            <Text className="text-lg font-quicksand-bold text-slate-800 mb-3">{editId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}</Text>
            <View className="mb-3">
              <Text className="text-[12px] text-slate-500 mb-1">Libellé (optionnel)</Text>
              <TextInput value={label} onChangeText={setLabel} placeholder="Domicile, Travail..." className="border border-slate-200 rounded-xl px-3 py-2 text-[14px] text-slate-700" />
            </View>
            <View className="mb-3">
              <Text className="text-[12px] text-slate-500 mb-1">Quartier (autocomplétion)</Text>
              <AddressAutocomplete
                placeholder="Ex: Ankorondrano, Analakely…"
                onSelected={({ label: lbl, lat: la, lng: ln }) => {
                  setMapboxText(lbl);
                  setLat(la); setLng(ln);
                }}
                initialText={mapboxText}
                onTextChange={(t) => setMapboxText(t)}
              />
            </View>
            <View className="mb-4">
              <Text className="text-[12px] text-slate-500 mb-1">Adresse exacte</Text>
              <TextInput value={detail} onChangeText={setDetail} placeholder="Bâtiment, étage, porte…" multiline className="border border-slate-200 rounded-xl px-3 py-2 text-[14px] text-slate-700 min-h-[80px]" />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity disabled={saving} onPress={closeForm} className="flex-1 rounded-full bg-slate-100 border border-slate-300 py-3 items-center">
                <Text className="text-slate-800 font-quicksand-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} onPress={onSubmit} className={`flex-1 rounded-full py-3 items-center ${saving ? 'bg-yellow-200' : 'bg-yellow-400'}`}>
                <Text className="text-slate-900 font-quicksand-bold">{editId ? 'Enregistrer' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
