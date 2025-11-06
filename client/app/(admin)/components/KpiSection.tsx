import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedMetric } from './AnimatedMetric';
import { Package, CheckCircle2, Clock, AlertTriangle, DollarSign } from 'lucide-react-native';

export type Period = 'today' | '7d';

export type KpiData = {
  ordersToday: number;
  deliveredToday: number;
  inProgress: number;
  late: number;
  revenueToday: number;
};

const kpiConfig = [
  {
    key: 'ordersToday' as keyof KpiData,
    label: 'Commandes',
    icon: Package,
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
  },
  {
    key: 'deliveredToday' as keyof KpiData,
    label: 'Livrées',
    icon: CheckCircle2,
    color: '#059669',
    gradient: ['#059669', '#047857'],
  },
  {
    key: 'inProgress' as keyof KpiData,
    label: 'En cours',
    icon: Clock,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    key: 'late' as keyof KpiData,
    label: 'En retard',
    icon: AlertTriangle,
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    key: 'revenueToday' as keyof KpiData,
    label: 'Revenu (Ar)',
    icon: DollarSign,
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    format: (n: number) => n.toLocaleString('fr-FR'),
  },
];

export function KpiSection({
  period,
  setPeriod,
  loading,
  error,
  data,
  onRefresh,
  showRefresh = true,
  showPeriodControls = true,
}: {
  period: Period;
  setPeriod: (p: Period | ((p: Period) => Period)) => void;
  loading: boolean;
  error: string | null;
  data: KpiData | null;
  onRefresh: () => void;
  showRefresh?: boolean;
  showPeriodControls?: boolean;
}) {
  return (
    <View className="mb-6">
      {showPeriodControls && (
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-900 font-quicksand-bold text-lg">Indicateurs clés</Text>
          <View className="flex-row gap-2 bg-gray-100 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setPeriod('today')}
              className="rounded-lg overflow-hidden"
              activeOpacity={0.7}
            >
              {period === 'today' ? (
                <LinearGradient
                  colors={['#059669', '#047857']}
                  className="px-4 py-2"
                >
                  <Text className="font-quicksand-semibold text-sm text-white">
                    Aujourd'hui
                  </Text>
                </LinearGradient>
              ) : (
                <View className="px-4 py-2 bg-transparent">
                  <Text className="font-quicksand-semibold text-sm text-gray-600">
                    Aujourd'hui
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPeriod('7d')}
              className="rounded-lg overflow-hidden"
              activeOpacity={0.7}
            >
              {period === '7d' ? (
                <LinearGradient
                  colors={['#059669', '#047857']}
                  className="px-4 py-2"
                >
                  <Text className="font-quicksand-semibold text-sm text-white">
                    7 jours
                  </Text>
                </LinearGradient>
              ) : (
                <View className="px-4 py-2 bg-transparent">
                  <Text className="font-quicksand-semibold text-sm text-gray-600">
                    7 jours
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      )}
      
      {!!error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-600 font-quicksand-medium">{error}</Text>
        </View>
      )}
      
      {data && (
        <View className="flex-row flex-wrap gap-4">
          {kpiConfig.map((config) => {
            const Icon = config.icon;
            const value = data[config.key];
            const formattedValue = config.format ? config.format(value as number) : value;
            
            return (
              <View
                key={config.key}
                className="flex-1 min-w-[140px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <LinearGradient
                  colors={config.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="bg-white/20 rounded-lg p-2">
                      <Icon size={20} color="#fff" strokeWidth={2.5} />
                    </View>
                  </View>
                  <Text className="text-white/90 text-xs font-quicksand-medium mb-1">
                    {config.label}
                  </Text>
                  <AnimatedMetric
                    value={value as number}
                    textClassName="text-white font-clash-bold text-2xl"
                    format={config.format}
                  />
                </LinearGradient>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
