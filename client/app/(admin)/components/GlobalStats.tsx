import React from 'react';
import { View, Text } from 'react-native';

export type GlobalStatsData = {
  totalAll: number;
  deliveredAll: number;
  inProgressAll: number;
  lateAll: number;
};

export function GlobalStats({ data }: { data: GlobalStatsData }) {
  const g = data || { totalAll: 0, deliveredAll: 0, inProgressAll: 0, lateAll: 0 };
  return (
    <View className="mb-6">
      <Text className="font-quicksand-bold mb-2">Global</Text>
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
          <Text className="text-slate-500 text-xs">Total commandes</Text>
          <Text className="font-quicksand-bold text-lg">{g.totalAll}</Text>
        </View>
        <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
          <Text className="text-slate-500 text-xs">Livrées</Text>
          <Text className="font-quicksand-bold text-lg text-emerald-700">{g.deliveredAll}</Text>
        </View>
        <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
          <Text className="text-slate-500 text-xs">En cours</Text>
          <Text className="font-quicksand-bold text-lg">{g.inProgressAll}</Text>
        </View>
        <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
          <Text className="text-slate-500 text-xs">En retard</Text>
          <Text className="font-quicksand-bold text-lg text-red-600">{g.lateAll}</Text>
        </View>
      </View>
    </View>
  );
}
