import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { getApiClient } from '@/lib/api/client';

export default function AdminDashboard() {
  const api = useMemo(getApiClient, []);
  // Placeholder: could fetch counters/stats later
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-quicksand-bold mb-2">Dashboard</Text>
      <Text className="text-slate-600">Bienvenue sur l'espace administrateur.</Text>
    </View>
  );
}
