import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, CheckCircle2, Clock, AlertTriangle } from 'lucide-react-native';
import { AnimatedMetric } from './AnimatedMetric';

export type GlobalStatsData = {
  totalAll: number;
  deliveredAll: number;
  inProgressAll: number;
  lateAll: number;
};

const globalStatsConfig = [
  {
    key: 'totalAll' as keyof GlobalStatsData,
    label: 'Total commandes',
    icon: Package,
    gradient: ['#3B82F6', '#2563EB'],
  },
  {
    key: 'deliveredAll' as keyof GlobalStatsData,
    label: 'Livrées',
    icon: CheckCircle2,
    gradient: ['#059669', '#047857'],
  },
  {
    key: 'inProgressAll' as keyof GlobalStatsData,
    label: 'En cours',
    icon: Clock,
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    key: 'lateAll' as keyof GlobalStatsData,
    label: 'En retard',
    icon: AlertTriangle,
    gradient: ['#EF4444', '#DC2626'],
  },
];

export function GlobalStats({ data }: { data: GlobalStatsData }) {
  const g = data || { totalAll: 0, deliveredAll: 0, inProgressAll: 0, lateAll: 0 };
  
  return (
    <View className="mb-6">
      <Text className="text-gray-900 font-quicksand-bold text-lg mb-4">Statistiques globales</Text>
      <View className="flex-row flex-wrap gap-4">
        {globalStatsConfig.map((config) => {
          const Icon = config.icon;
          const value = g[config.key];
          
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
                  value={value}
                  textClassName="text-white font-clash-bold text-2xl"
                />
              </LinearGradient>
            </View>
          );
        })}
      </View>
    </View>
  );
}
