import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CalendarDays, User, TrendingUp, RefreshCw, Clock3 } from 'lucide-react-native';
import { useAdminReports, type HistoryPreset } from './hooks/useAdminReports';

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '';
  return d.toLocaleDateString('fr-FR');
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const {
    clientReport,
    loadingClient,
    errorClient,
    history,
    loadingHistory,
    errorHistory,
    historyPreset,
    loadClientReport,
    loadHistory,
  } = useAdminReports();

  const [viewTab, setViewTab] = React.useState<'client' | 'history'>('client');
  const [clientIdInput, setClientIdInput] = React.useState('');
  const [dateFromInput, setDateFromInput] = React.useState('');
  const [dateToInput, setDateToInput] = React.useState('');

  React.useEffect(() => {
    loadHistory('7d').catch(() => {});
  }, [loadHistory]);

  const onRunClientReport = React.useCallback(() => {
    const trimmedId = clientIdInput.trim();
    if (!trimmedId) {
      return;
    }
    const idNum = Number(trimmedId);
    if (!Number.isFinite(idNum)) {
      return;
    }
    const from = dateFromInput.trim() || undefined;
    const to = dateToInput.trim() || undefined;
    loadClientReport(idNum, from, to);
  }, [clientIdInput, dateFromInput, dateToInput, loadClientReport]);

  const hasClientReport = !!clientReport && (clientReport.items?.length ?? 0) > 0;
  const hasHistorySettlements = !!history && (history.settlements?.length ?? 0) > 0;
  const hasHistoryDispatches = !!history && (history.dispatches?.length ?? 0) > 0;

  const selectPreset = (preset: HistoryPreset) => {
    loadHistory(preset).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      <View className="flex-row items-center px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-clash-bold">Rapports & Exports</Text>
          <Text className="text-gray-500 text-xs font-quicksand">Rapports clients et historique des règlements</Text>
        </View>
      </View>

      <View className="flex-row mx-4 mt-3 mb-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        <TouchableOpacity
          onPress={() => setViewTab('client')}
          className={`flex-1 rounded-xl py-2 items-center ${
            viewTab === 'client' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              viewTab === 'client' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Rapport client
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewTab('history')}
          className={`flex-1 rounded-xl py-2 items-center ${
            viewTab === 'history' ? 'bg-emerald-600' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-xs font-quicksand-semibold ${
              viewTab === 'history' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-2 pb-6">
          {viewTab === 'client' ? (
            <View>
              <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                <Text className="text-gray-900 font-quicksand-semibold text-sm mb-3">Filtres rapport client</Text>

                <View className="mb-3">
                  <Text className="text-gray-500 text-xs font-quicksand mb-1">ID client (expéditeur)</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                    <User size={18} color="#64748B" />
                    <TextInput
                      value={clientIdInput}
                      onChangeText={setClientIdInput}
                      placeholder="Ex: 12"
                      className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-quicksand mb-1">Du (AAAA-MM-JJ)</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                      <CalendarDays size={18} color="#64748B" />
                      <TextInput
                        value={dateFromInput}
                        onChangeText={setDateFromInput}
                        placeholder="2025-01-01"
                        className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-quicksand mb-1">Au (AAAA-MM-JJ)</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
                      <CalendarDays size={18} color="#64748B" />
                      <TextInput
                        value={dateToInput}
                        onChangeText={setDateToInput}
                        placeholder="2025-01-31"
                        className="flex-1 ml-2 text-gray-900 text-sm font-quicksand"
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onRunClientReport}
                  activeOpacity={0.7}
                  className="mt-1 flex-row items-center justify-center bg-emerald-600 rounded-xl py-2.5"
                >
                  {loadingClient ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <RefreshCw size={18} color="#fff" />
                      <Text className="ml-2 text-white text-sm font-quicksand-semibold">Générer le rapport</Text>
                    </>
                  )}
                </TouchableOpacity>

                {errorClient && (
                  <Text className="mt-2 text-xs text-red-600 font-quicksand">{errorClient}</Text>
                )}
              </View>

              {loadingClient && !hasClientReport && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              )}

              {clientReport && !hasClientReport && !loadingClient && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <Text className="text-gray-500 text-sm font-quicksand">
                    Aucune livraison trouvée pour ce client sur la période sélectionnée.
                  </Text>
                </View>
              )}

              {clientReport && hasClientReport && (
                <View>
                  <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                    <Text className="text-gray-900 font-quicksand-bold text-sm mb-2">Synthèse client</Text>
                    <Text className="text-gray-800 text-base font-clash-bold mb-1">
                      {clientReport.client?.name || `Client #${clientReport.client?.id}`}
                    </Text>
                    <Text className="text-gray-500 text-xs font-quicksand mb-2">
                      {clientReport.client?.phone || clientReport.client?.email || 'Coordonnées non renseignées'}
                    </Text>
                    <View className="flex-row flex-wrap gap-3 mt-2">
                      <View className="flex-1 min-w-[130px] bg-sky-50 rounded-xl p-3 border border-sky-100">
                        <Text className="text-sky-700 text-xs font-quicksand-medium mb-1">Livraisons</Text>
                        <Text className="text-xl font-clash-bold text-sky-800">
                          {clientReport.totals?.totalOrders ?? 0}
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[130px] bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <Text className="text-emerald-700 text-xs font-quicksand-medium mb-1">Net client</Text>
                        <Text className="text-lg font-clash-bold text-emerald-800">
                          {clientReport.totals?.totalClientNet ?? 0} Ar
                        </Text>
                      </View>
                      <View className="flex-1 min-w-[130px] bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                        <Text className="text-indigo-700 text-xs font-quicksand-medium mb-1">Net admin</Text>
                        <Text className="text-lg font-clash-bold text-indigo-800">
                          {clientReport.totals?.totalAdminNet ?? 0} Ar
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-900 font-quicksand-bold text-sm">Détail des livraisons</Text>
                      <Text className="text-gray-400 text-xs font-quicksand">
                        {clientReport.items?.length ?? 0} livraisons
                      </Text>
                    </View>
                    {clientReport.items?.map((item) => {
                      const id = item.id ?? 0;
                      const clientPositive = (item.clientNet ?? 0) >= 0;
                      const adminPositive = (item.adminNet ?? 0) >= 0;
                      return (
                        <View
                          key={id}
                          className="py-3 border-b border-gray-100 last:border-0"
                        >
                          <View className="flex-row items-center justify-between mb-1">
                            <View className="flex-1 mr-2">
                              <Text className="text-gray-900 font-quicksand-semibold text-sm">
                                Commande #{id}
                              </Text>
                              <Text className="text-[11px] text-gray-500 font-quicksand">
                                {formatDate(item.createdAt)} • {item.status}
                              </Text>
                            </View>
                            <View className="items-end">
                              <Text className="text-[11px] text-gray-500 font-quicksand">
                                Montant colis
                              </Text>
                              <Text className="text-xs font-clash-bold text-gray-900">
                                {item.priceTotal ?? 0} Ar
                              </Text>
                            </View>
                          </View>
                          <View className="flex-row gap-3 mt-1">
                            <View
                              className={`flex-1 rounded-lg px-2 py-1 ${
                                clientPositive ? 'bg-emerald-50' : 'bg-rose-50'
                              }`}
                            >
                              <Text
                                className={`text-[10px] font-quicksand-medium ${
                                  clientPositive ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                Net client
                              </Text>
                              <Text
                                className={`text-xs font-clash-bold ${
                                  clientPositive ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                              >
                                {item.clientNet ?? 0} Ar
                              </Text>
                            </View>
                            <View
                              className={`flex-1 rounded-lg px-2 py-1 ${
                                adminPositive ? 'bg-emerald-50' : 'bg-rose-50'
                              }`}
                            >
                              <Text
                                className={`text-[10px] font-quicksand-medium ${
                                  adminPositive ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                Net admin
                              </Text>
                              <Text
                                className={`text-xs font-clash-bold ${
                                  adminPositive ? 'text-emerald-800' : 'text-rose-800'
                                }`}
                              >
                                {item.adminNet ?? 0} Ar
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Clock3 size={18} color="#0F172A" />
                    <Text className="text-gray-900 font-quicksand-semibold text-sm">Période</Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  {(['today', '7d', '30d', 'all'] as HistoryPreset[]).map((preset) => {
                    const active = historyPreset === preset;
                    const label =
                      preset === 'today'
                        ? "Aujourd'hui"
                        : preset === '7d'
                        ? '7 jours'
                        : preset === '30d'
                        ? '30 jours'
                        : 'Tout';
                    return (
                      <TouchableOpacity
                        key={preset}
                        onPress={() => selectPreset(preset)}
                        activeOpacity={0.7}
                        className={`flex-1 rounded-xl py-2 items-center border ${
                          active ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-quicksand-semibold ${
                            active ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {errorHistory && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                  <Text className="text-red-600 text-xs font-quicksand">{errorHistory}</Text>
                </View>
              )}

              {loadingHistory && !hasHistoryDispatches && !hasHistorySettlements && (
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#059669" />
                </View>
              )}

              {!loadingHistory && !hasHistoryDispatches && !hasHistorySettlements && !errorHistory && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <Text className="text-gray-500 text-sm font-quicksand">
                    Aucun règlement ni dispatch trouvé sur la période sélectionnée.
                  </Text>
                </View>
              )}

              {hasHistorySettlements && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-900 font-quicksand-bold text-sm">Règlements du soir</Text>
                    <Text className="text-gray-400 text-xs font-quicksand">
                      {history?.settlements?.length ?? 0} éléments
                    </Text>
                  </View>
                  {history?.settlements?.map((s, idx) => {
                    const status = s.status || 'DECLARED';
                    const statusLabel = status === 'CONFIRMED' ? 'Confirmé' : 'Déclaré';
                    const statusColor = status === 'CONFIRMED' ? 'bg-emerald-50' : 'bg-amber-50';
                    const statusTextColor = status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-700';
                    return (
                      <View
                        key={`${s.courierId}-${s.date}-${idx}`}
                        className="py-3 border-b border-gray-100 last:border-0"
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-gray-900 font-quicksand-semibold text-sm">
                            Livreur #{s.courierId}
                          </Text>
                          <View className={`px-3 py-1 rounded-full ${statusColor}`}>
                            <Text className={`text-[11px] font-quicksand-semibold ${statusTextColor}`}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-[11px] text-gray-500 font-quicksand mb-1">
                          Date: {s.date} • Cash {s.cashAmount ?? 0} Ar • Mobile {s.mobileMoneyAmount ?? 0} Ar
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {hasHistoryDispatches && (
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-900 font-quicksand-bold text-sm">Dispatches J+1</Text>
                    <Text className="text-gray-400 text-xs font-quicksand">
                      {history?.dispatches?.length ?? 0} éléments
                    </Text>
                  </View>
                  {history?.dispatches?.map((d) => {
                    const status = d.status || 'WAITING_COURIER';
                    const statusLabel =
                      status === 'COMPLETED'
                        ? 'Terminé'
                        : status === 'IN_PROGRESS'
                        ? 'En cours'
                        : 'En attente du livreur';
                    const statusColor =
                      status === 'COMPLETED'
                        ? 'bg-emerald-50'
                        : status === 'IN_PROGRESS'
                        ? 'bg-amber-50'
                        : 'bg-sky-50';
                    const statusTextColor =
                      status === 'COMPLETED'
                        ? 'text-emerald-700'
                        : status === 'IN_PROGRESS'
                        ? 'text-amber-700'
                        : 'text-sky-700';
                    return (
                      <View
                        key={d.id}
                        className="py-3 border-b border-gray-100 last:border-0"
                      >
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-gray-900 font-quicksand-semibold text-sm">
                            Dispatch #{d.id}
                          </Text>
                          <View className={`px-3 py-1 rounded-full ${statusColor}`}>
                            <Text className={`text-[11px] font-quicksand-semibold ${statusTextColor}`}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-[11px] text-gray-500 font-quicksand mb-1">
                          Client #{d.clientId} • Livreur #{d.courierId}
                        </Text>
                        <Text className="text-[11px] text-gray-500 font-quicksand">
                          Net {d.netAmount ?? 0} Ar • Cash {d.cashAmount ?? 0} Ar • Mobile {d.mobileMoneyAmount ?? 0} Ar
                        </Text>
                        <Text className="text-[10px] text-gray-400 font-quicksand mt-1">
                          Créé le {formatDate(d.createdAt)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
