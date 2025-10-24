import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { Ionicons } from '@expo/vector-icons';

export default function AddressesScreen() {
  const api = useMemo(getApiClient, []);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Array<{ id: string; label?: string; detail: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any[] = await (api as any).addresses.getApiAddresses();
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : []).map((r) => ({ id: String(r.id), label: r.label, detail: r.detail }));
        setRows(normalized);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between">
        <Text className="text-xl font-quicksand-bold text-slate-800">Mes adresses</Text>
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
                <Text className="text-[12px] text-slate-400">{a.label || 'Adresse'}</Text>
                <Text className="text-[14px] text-slate-700">{a.detail}</Text>
              </View>
            ))
          )}
          <View className="h-4" />
          <Text className="text-[12px] text-slate-400">Edition complète (ajout/modif/suppression) à venir.</Text>
        </ScrollView>
      )}
    </View>
  );
}
