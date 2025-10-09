import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AnimatedMetric } from './AnimatedMetric';

export type Period = 'today' | '7d';

export type KpiData = {
  ordersToday: number;
  deliveredToday: number;
  inProgress: number;
  late: number;
  revenueToday: number;
};

export function KpiSection({
  period,
  setPeriod,
  loading,
  error,
  data,
  onRefresh,
}: {
  period: Period;
  setPeriod: (p: Period | ((p: Period) => Period)) => void;
  loading: boolean;
  error: string | null;
  data: KpiData | null;
  onRefresh: () => void;
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-quicksand-bold">KPIs</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => setPeriod('today')} className={`px-3 py-1 rounded border ${period==='today' ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
            <Text className={period==='today' ? 'text-white' : 'text-slate-700'}>Aujourd'hui</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPeriod('7d')} className={`px-3 py-1 rounded border ${period==='7d' ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
            <Text className={period==='7d' ? 'text-white' : 'text-slate-700'}>7 jours</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={loading} onPress={onRefresh} className={`px-3 py-1 rounded border flex-row items-center gap-2 ${loading ? 'border-slate-200 bg-slate-100' : 'border-slate-300'}`}>
            {loading ? <ActivityIndicator size="small" color="#475569" /> : <Text className="text-slate-700">Rafraîchir</Text>}
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <View className="mb-2">
          <ActivityIndicator size="small" color="#059669" />
        </View>
      )}
      {!!error && (<Text className="text-red-600 mb-2">{error}</Text>)}
      {data && (
        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <Text className="text-slate-500 text-xs">Commandes</Text>
            <AnimatedMetric value={data.ordersToday} textClassName="font-quicksand-bold text-lg" />
          </View>
          <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <Text className="text-slate-500 text-xs">Livrées</Text>
            <AnimatedMetric value={data.deliveredToday} textClassName="font-quicksand-bold text-lg text-emerald-700" />
          </View>
          <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <Text className="text-slate-500 text-xs">En cours</Text>
            <AnimatedMetric value={data.inProgress} textClassName="font-quicksand-bold text-lg" />
          </View>
          <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <Text className="text-slate-500 text-xs">En retard</Text>
            <AnimatedMetric value={data.late} textClassName="font-quicksand-bold text-lg text-red-600" />
          </View>
          <View className="min-w-[150px] flex-1 px-4 py-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <Text className="text-slate-500 text-xs">Revenu (Ar)</Text>
            <AnimatedMetric value={data.revenueToday} textClassName="font-quicksand-bold text-lg" format={(n)=>n.toLocaleString('fr-FR')} />
          </View>
        </View>
      )}
    </View>
  );
}
