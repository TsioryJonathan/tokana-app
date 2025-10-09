import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { Link } from 'expo-router';
import { AvailabilityCards } from './components/AvailabilityCards';
import { KpiSection } from './components/KpiSection';
import { GlobalStats } from './components/GlobalStats';
import { OrdersChart } from './components/OrdersChart';
import { useBusinessAvailability } from './hooks/useBusinessAvailability';
import { useAdminStats } from './hooks/useAdminStats';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { useZonesGeom } from './hooks/useZonesGeom';

export default function AdminDashboard() {
  const { isStandardOrderWindow, isExpressWindow, now } = useBusinessAvailability();
  const { zones, geomStatus, loading, error: loadError } = useZonesGeom();
  const { period, setPeriod, stats, loading: statsLoading, error: statsError, refresh } = useAdminStats('today');
  const { enabled: autoRefresh, setEnabled: setAutoRefresh } = useAutoRefresh(() => refresh(), { storageKey: 'admin_kpis_autorefresh', intervalMs: 60000, defaultEnabled: true });
  const [viewTab, setViewTab] = React.useState<'today' | 'global'>('today');
  const activeTopTab: 'globalite' | 'today' | '7d' = viewTab === 'global' ? 'globalite' : (period === '7d' ? '7d' : 'today');

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xl font-quicksand-bold">Dashboard</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-slate-600 text-xs">Auto-refresh</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              accessibilityLabel="Activer ou désactiver l'auto-refresh des KPIs toutes les 60 secondes"
            />
          </View>
          <TouchableOpacity
            onPress={() => refresh()}
            className="px-3 py-1 rounded border border-slate-300"
            accessibilityLabel="Rafraîchir les données du dashboard"
            accessibilityHint="Recharge les statistiques et KPIs visibles"
          >
            <Text className="text-slate-700">Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Disponibilités (cohérence TZ Indian/Antananarivo) */}
      <AvailabilityCards isStandard={isStandardOrderWindow} isExpress={isExpressWindow} />

      {/* Vue: Globalité des données vs Aujourd’hui / Global (7j) */}
      <View className="mt-3">
        <View className="flex-row flex-wrap gap-2 bg-white border border-slate-200 rounded-2xl p-2 items-center">
          <TouchableOpacity
            onPress={() => setViewTab('global')}
            className={`px-3 py-2 rounded-lg ${activeTopTab === 'globalite' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher la vue Globalité des données"
            accessibilityHint="Affiche les totaux globaux toutes périodes confondues"
          >
            <Text className={`${activeTopTab === 'globalite' ? 'text-white' : 'text-slate-700'}`}>Globalité</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setViewTab('today'); setPeriod('today'); }}
            className={`px-3 py-2 rounded-lg ${activeTopTab === 'today' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher la vue Aujourd’hui"
            accessibilityHint="Affiche les KPIs du jour et les contrôles de période"
          >
            <Text className={`${activeTopTab === 'today' ? 'text-white' : 'text-slate-700'}`}>Aujourd’hui</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setViewTab('today'); setPeriod('7d'); }}
            className={`px-3 py-2 rounded-lg ${activeTopTab === '7d' ? 'bg-emerald-600' : 'bg-slate-100'}`}
            accessibilityLabel="Afficher la période Global (7 jours)"
            accessibilityHint="Affiche les KPIs agrégés sur les 7 derniers jours"
          >
            <Text className={`${activeTopTab === '7d' ? 'text-white' : 'text-slate-700'}`}>Global (7j)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone métriques selon l'onglet */}
      {viewTab === 'global' ? (
        <View className="mt-3">
          {statsLoading && (
            <View className="mb-2"><ActivityIndicator size="small" color="#059669" /></View>
          )}
          {!!statsError && (<Text className="text-red-600 mb-2">{statsError}</Text>)}
          {stats && (
            <GlobalStats
              data={{
                totalAll: stats.global?.totalAll ?? 0,
                deliveredAll: stats.global?.deliveredAll ?? 0,
                inProgressAll: stats.global?.inProgressAll ?? 0,
                lateAll: stats.global?.lateAll ?? 0,
              }}
            />
          )}
        </View>
      ) : (
        <View>
          <View className="flex-row items-center justify-between">
            <Text className="sr-only">En-tête KPIs</Text>
            <View className="ml-auto" />
          </View>
          {/* Graphique sous le header KPIs, centré et largeur adaptable */}
          {(() => { const series = stats?.seriesOrders7d ?? []; return series.length > 0 ? (
            <View className="w-full items-center my-2">
              <OrdersChart data={series} accessibilityLabel={`Graphique des commandes sur 7 jours: ${series.join(', ')}`} />
              <Text accessibilityLabel="Légende graphique: Commandes sur 7 jours" className="text-[10px] text-slate-500 mt-1">Commandes 7j</Text>
            </View>
          ) : null; })()}
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
          <Text className="font-quicksand-bold mb-2">Alertes</Text>
          <View className="flex-row gap-3 flex-wrap">
            <View className={`px-4 py-3 rounded-md border ${(stats.heavyCount ?? 0) > 0 ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
              <Text className="text-slate-500 text-xs">{`Colis > 5kg`}</Text>
              <Text className="font-quicksand-bold">{stats.heavyCount ?? 0}</Text>
            </View>
            <View className={`px-4 py-3 rounded-md border ${(stats.otpPending ?? 0) > 0 ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
              <Text className="text-slate-500 text-xs">OTP en attente</Text>
              <Text className="font-quicksand-bold">{stats.otpPending ?? 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Statut géométrie des zones */}
      <View className="mb-6">
        <Text className="font-quicksand-bold mb-2">Statut géométries des zones</Text>
        {loading && (
          <View className="mb-2">
            <ActivityIndicator size="small" color="#64748b" />
          </View>
        )}
        {!!loadError && (<Text className="text-red-600 mb-2">{loadError}</Text>)}
        {(zones || []).map((z) => {
          const st = geomStatus[z.id!] || 'unknown';
          const isOk = st === 'ok';
          return (
            <View key={z.id} className="flex-row items-center justify-between border border-slate-200 rounded-md px-3 py-2 mb-2">
              <Text>{z.key} — {z.label}</Text>
              <Text className={isOk ? 'text-emerald-700' : 'text-red-600'}>{isOk ? 'OK' : 'Non configurée'}</Text>
            </View>
          );
        })}
        <View className="mt-2">
          <Link href="/(admin)/zones" asChild>
            <TouchableOpacity className="self-start px-3 py-2 rounded bg-emerald-600">
              <Text className="text-white">Gérer les zones</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <Text className="text-xs text-slate-500">Heure locale: {now.toLocaleString()}</Text>
    </ScrollView>
  );
}
