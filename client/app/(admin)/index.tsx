import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AvailabilityCards } from './components/AvailabilityCards';
import { KpiSection } from './components/KpiSection';
import { GlobalStats } from './components/GlobalStats';
import { OrdersChart } from './components/OrdersChart';
import { useRouter } from 'expo-router';
import { useBusinessAvailability } from './hooks/useBusinessAvailability';
import { useAdminStats } from './hooks/useAdminStats';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { useZonesGeom } from './hooks/useZonesGeom';
import { RefreshCw, TrendingUp, AlertCircle, CheckCircle2, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const { isStandardOrderWindow, isExpressWindow, now } = useBusinessAvailability();
  const router = useRouter();
  const { zones, geomStatus, loading, error: loadError } = useZonesGeom();
  const { period, setPeriod, stats, loading: statsLoading, error: statsError, refresh } = useAdminStats('today');
  const { enabled: autoRefresh, setEnabled: setAutoRefresh } = useAutoRefresh(() => refresh(), { storageKey: 'admin_kpis_autorefresh', intervalMs: 60000, defaultEnabled: true });
  const [viewTab, setViewTab] = React.useState<'today' | 'global'>('today');
  const [refreshing, setRefreshing] = React.useState(false);
  const activeTopTab: 'globalite' | 'today' | '7d' = viewTab === 'global' ? 'globalite' : (period === '7d' ? '7d' : 'today');

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#059669', '#047857', '#065F46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-6 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-3xl font-clash-bold mb-1">Dashboard</Text>
              <Text className="text-emerald-100 text-sm font-quicksand">
                {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 rounded-full px-4 py-2 flex-row items-center gap-2">
                <Text className="text-white text-xs font-quicksand-medium">Auto-refresh</Text>
                <Switch
                  value={autoRefresh}
                  onValueChange={setAutoRefresh}
                  trackColor={{ false: '#94A3B8', true: '#10B981' }}
                  thumbColor="#fff"
                />
              </View>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-white/20 rounded-full p-2.5"
                activeOpacity={0.7}
              >
                <RefreshCw size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Disponibilités */}
          <AvailabilityCards isStandard={isStandardOrderWindow} isExpress={isExpressWindow} />
        </LinearGradient>

        {/* Contenu principal */}
        <View className="px-6 pt-6 pb-24">
          {/* Tabs de navigation */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-6">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setViewTab('global')}
                className="flex-1 rounded-xl overflow-hidden"
                activeOpacity={0.7}
              >
                {activeTopTab === 'globalite' ? (
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    className="py-3 items-center"
                  >
                    <Text className="font-quicksand-semibold text-white">
                      Globalité
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="py-3 items-center bg-gray-50">
                    <Text className="font-quicksand-semibold text-gray-600">
                      Globalité
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setViewTab('today'); setPeriod('today'); }}
                className="flex-1 rounded-xl overflow-hidden"
                activeOpacity={0.7}
              >
                {activeTopTab === 'today' ? (
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    className="py-3 items-center"
                  >
                    <Text className="font-quicksand-semibold text-white">
                      Aujourd&apos;hui
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="py-3 items-center bg-gray-50">
                    <Text className="font-quicksand-semibold text-gray-600">
                      Aujourd&apos;hui
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setViewTab('today'); setPeriod('7d'); }}
                className="flex-1 rounded-xl overflow-hidden"
                activeOpacity={0.7}
              >
                {activeTopTab === '7d' ? (
                  <LinearGradient
                    colors={['#059669', '#047857']}
                    className="py-3 items-center"
                  >
                    <Text className="font-quicksand-semibold text-white">
                      7 jours
                    </Text>
                  </LinearGradient>
                ) : (
                  <View className="py-3 items-center bg-gray-50">
                    <Text className="font-quicksand-semibold text-gray-600">
                      7 jours
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Zone métriques selon l'onglet */}
          {viewTab === 'global' ? (
            <View className="mb-6">
              {statsLoading && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              )}
              {!!statsError && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <Text className="text-red-600 font-quicksand-medium">{statsError}</Text>
                </View>
              )}
              {stats && (
                <GlobalStats
                  data={{
                    totalAll: stats.global?.totalAll ?? 0,
                    deliveredAll: stats.global?.deliveredAll ?? 0,
                    inProgressAll: stats.global?.inProgressAll ?? 0,
                    lateAll: stats.global?.lateAll ?? 0,
                    totalClients: stats.global?.totalClients ?? 0,
                    totalLivreurs: stats.global?.totalLivreurs ?? 0,
                  }}
                />
              )}
            </View>
          ) : (
            <View>
              {/* Graphique */}
              {(() => { 
                const series = stats?.seriesOrders7d ?? []; 
                return series.length > 0 ? (
                  <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-gray-900 font-quicksand-bold text-lg">Évolution des commandes</Text>
                      <TrendingUp size={20} color="#059669" />
                    </View>
                    <OrdersChart data={series} accessibilityLabel={`Graphique des commandes sur 7 jours: ${series.join(', ')}`} />
                    <Text className="text-gray-400 text-xs mt-2 text-center font-quicksand">
                      Commandes sur 7 jours
                    </Text>
                  </View>
                ) : null; 
              })()}

              {/* KPIs */}
              <KpiSection
                period={period}
                setPeriod={setPeriod}
                loading={statsLoading}
                error={statsError}
                data={stats ? {
                  ordersToday: stats.ordersToday ?? 0,
                  deliveredToday: stats.deliveredToday ?? 0,
                  inProgress: stats.inProgress ?? 0,
                  late: stats.late ?? 0,
                  revenueToday: stats.revenueToday ?? 0,
                } : null}
                onRefresh={() => refresh()}
                showRefresh={false}
                showPeriodControls={false}
              />
            </View>
          )}

          {/* Alertes */}
          {stats && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-4">
                <AlertCircle size={20} color="#F59E0B" />
                <Text className="text-gray-900 font-quicksand-bold text-lg">Alertes</Text>
              </View>
              <View className="flex-row gap-3 flex-wrap">
                <View className={`flex-1 min-w-[140px] rounded-xl p-4 border ${
                  (stats.heavyCount ?? 0) > 0 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <Text className="text-gray-500 text-xs font-quicksand-medium mb-1">Colis lourds (&gt5kg)</Text>
                  <Text className={`text-2xl font-clash-bold ${
                    (stats.heavyCount ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'
                  }`}>
                    {stats.heavyCount ?? 0}
                  </Text>
                </View>
                <View className={`flex-1 min-w-[140px] rounded-xl p-4 border ${
                  (stats.otpPending ?? 0) > 0 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <Text className="text-gray-500 text-xs font-quicksand-medium mb-1">OTP en attente</Text>
                  <Text className={`text-2xl font-clash-bold ${
                    (stats.otpPending ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'
                  }`}>
                    {stats.otpPending ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className="mb-6">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(admin)/settlements-evening' as any)}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 flex-row items-center justify-between mb-3"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-quicksand-bold text-lg">Règlement du soir</Text>
                <Text className="text-gray-500 text-xs font-quicksand mt-1">
                  Voir le détail des encaissements livreur → admin par jour.
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                <RefreshCw size={20} color="#059669" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(admin)/dispatches' as any)}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 flex-row items-center justify-between mb-3"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-quicksand-bold text-lg">Dispatches J+1</Text>
                <Text className="text-gray-500 text-xs font-quicksand mt-1">
                  Préparer et suivre les règlements Admin → Clients.
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                <RefreshCw size={20} color="#059669" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(admin)/reports' as any)}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 flex-row items-center justify-between mb-3"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-quicksand-bold text-lg">Rapports & Exports</Text>
                <Text className="text-gray-500 text-xs font-quicksand mt-1">
                  Rapports clients et historique des règlements.
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                <TrendingUp size={20} color="#059669" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(admin)/gps' as any)}
              className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 flex-row items-center justify-between"
            >
              <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-quicksand-bold text-lg">Suivi GPS</Text>
                <Text className="text-gray-500 text-xs font-quicksand mt-1">
                  Voir les positions et le statut de tracking des livreurs.
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                <MapPin size={20} color="#059669" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Statut géométrie des zones */}
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <MapPin size={20} color="#059669" />
              <Text className="text-gray-900 font-quicksand-bold text-lg">Statut des zones</Text>
            </View>
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {loading && (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" color="#059669" />
                </View>
              )}
              {!!loadError && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                  <Text className="text-red-600 text-sm font-quicksand">{loadError}</Text>
                </View>
              )}
              {(zones || []).slice(0, 5).map((z) => {
                const st = geomStatus[z.id!] || 'unknown';
                const isOk = st === 'ok';
                return (
                  <View key={z.id} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-quicksand-semibold">{z.label}</Text>
                      <Text className="text-gray-400 text-xs font-quicksand">{z.key}</Text>
                    </View>
                    <View className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full ${
                      isOk ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      {isOk ? (
                        <CheckCircle2 size={16} color="#059669" />
                      ) : (
                        <AlertCircle size={16} color="#EF4444" />
                      )}
                      <Text className={`text-xs font-quicksand-semibold ${
                        isOk ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {isOk ? 'OK' : 'Non configurée'}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {zones && zones.length > 5 && (
                <Text className="text-gray-400 text-xs text-center mt-3 font-quicksand">
                  +{zones.length - 5} autres zones
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
