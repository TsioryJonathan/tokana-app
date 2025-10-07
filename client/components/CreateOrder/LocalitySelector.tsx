import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useLocalities, type LocalityItem } from '@/lib/hooks/useLocalities';

export function LocalitySelector({
  selected,
  onSelect,
  onReset,
  label = 'Localité / Quartier (pour déterminer la zone)',
}: {
  selected: LocalityItem | null;
  onSelect: (loc: LocalityItem) => void;
  onReset: () => void;
  label?: string;
}) {
  const { loading, error, search } = useLocalities();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocalityItem[]>([]);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    setResults(search(query, 10));
  }, [query, search]);

  return (
    <View className="mt-3">
      <Text className="text-[12px] text-slate-600 mb-1">{label}</Text>
      <View className="bg-white border border-slate-200 rounded-xl">
        <View className="px-3 py-2">
          <TextInput
            placeholder={loading ? 'Chargement des localités…' : 'Ex: Analakely, Anosy, Andavamamba…'}
            value={selected ? selected.name : query}
            onChangeText={(t) => { setQuery(t); if (selected) onReset(); }}
            editable={!loading}
          />
        </View>
        {error ? (
          <View className="px-3 pb-2">
            <Text className="text-[11px] text-rose-700">{error}</Text>
          </View>
        ) : null}
        {results.length > 0 && (
          <View className="border-t border-slate-200">
            {results.map((it) => (
              <TouchableOpacity
                key={it.id}
                onPress={() => {
                  onSelect(it);
                  setQuery(it.name);
                  setResults([]);
                }}
                className="px-3 py-2 active:bg-slate-50"
              >
                <Text className="text-[14px] text-slate-800">{it.name}</Text>
                <Text className="text-[11px] text-slate-500">Zone: {it.zoneLevel.replace('-', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {selected ? (
        <View className="mt-2 flex-row items-center gap-2">
          <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <Text className="text-[11px] text-emerald-700">Zone déduite: {selected.zoneLevel}</Text>
          </View>
          <TouchableOpacity onPress={onReset}>
            <Text className="text-[11px] text-slate-500 underline">Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-2">
          <Text className="text-[11px] text-slate-500">Astuce: choisissez une localité pour fixer la zone automatiquement.</Text>
        </View>
      )}
    </View>
  );
}

export default LocalitySelector;
