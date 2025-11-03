import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMapboxGeocoding } from '@/lib/hooks/useMapboxGeocoding';
import type { MapboxFeature } from '@/lib/mapbox/geocoding';

export type AddressAutocompleteProps = {
  label?: string;
  placeholder?: string;
  bbox?: [number, number, number, number];
  onSelected: (sel: { label: string; lat: number; lng: number; feature: MapboxFeature }) => void;
  initialText?: string;
  onTextChange?: (text: string) => void;
  containerClassName?: string;
  inputClassName?: string;
};

export default function AddressAutocomplete({ label = 'Adresse (autocomplétion)', placeholder = "Saisir l'adresse", bbox, onSelected, initialText = '', onTextChange, containerClassName, inputClassName }: AddressAutocompleteProps) {
  const { query, setQuery, loading, error, suggestions } = useMapboxGeocoding(initialText, {
    limit: 5,
    bbox,
    country: 'MG',
    debounceMs: 350,
  });
  const [selectedAddress, setSelectedAddress] = React.useState<string>('');

  // Sync initialText when it changes externally (e.g., when saved address is selected)
  React.useEffect(() => {
    if (initialText && initialText !== query && !selectedAddress) {
      setQuery(initialText);
    }
  }, [initialText]);

  const handleSelect = (f: any) => {
    const [lng, lat] = f.center;
    const address = f.place_name;
    setSelectedAddress(address);
    setQuery(''); // Clear query to close dropdown
    onTextChange?.(address); // Update parent with selected address
    onSelected({ label: address, lat, lng, feature: f });
  };

  return (
    <View className={containerClassName}>
      {!!label && <Text className="text-[12px] text-slate-600 mb-1">{label}</Text>}
      <TextInput
        placeholder={placeholder}
        value={selectedAddress || query}
        onChangeText={(t) => { 
          setQuery(t); 
          setSelectedAddress(''); // Clear selected when typing
          onTextChange?.(t); 
        }}
        className={inputClassName || "px-3 py-2 rounded-xl bg-white border border-slate-200"}
        autoCorrect={false}
        autoCapitalize="none"
        style={{ borderWidth: 0 }}
      />
      {loading && !selectedAddress ? (
        <View className="mt-2 flex-row items-center">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className="ml-2 text-[12px] text-slate-500">Recherche…</Text>
        </View>
      ) : error ? (
        <Text className="mt-2 text-[12px] text-rose-700">{error}</Text>
      ) : suggestions && suggestions.length > 0 && !selectedAddress ? (
        <View className="mt-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          {suggestions.map((f) => (
            <TouchableOpacity
              key={f.id}
              activeOpacity={0.8}
              className="px-3 py-2 border-b border-slate-100"
              onPress={() => handleSelect(f)}
            >
              <Text className="text-[13px] text-slate-800">{f.text}</Text>
              <Text className="text-[11px] text-slate-500">{f.place_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null }
    </View>
  );
}
