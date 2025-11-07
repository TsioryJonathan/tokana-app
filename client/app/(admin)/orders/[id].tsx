import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapBackendStatus, statusLabel } from '../../../lib/mappers/order';
import { PricingQuoteRequest } from '../../../lib/api/models/PricingQuoteRequest';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiClient } from '../../../lib/api/client';
import type { Order } from '../../../lib/api/models/Order';
import { useToast } from '../../../components/ui/Toast';
import { OTPRequest } from '../../../lib/api/models/OTPRequest';

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignVal, setAssignVal] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [svcQuote, setSvcQuote] = useState<{ total?: number; pickup?: number; delivery?: number; express?: number; manual?: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const o = await api.orders.getApiOrders1(orderId);
      setOrder(o);
      setAssignVal(o.assignedTo != null ? String(o.assignedTo) : '');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminOrderDetail] load error', e?.body || e?.message || e);
      showToast('Chargement de la commande échoué', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, orderId, showToast]);

  useEffect(() => {
    if (!Number.isFinite(orderId)) return;
    load();
  }, [orderId, load]);

  // Fetch pricing quote for the current order to compute service fee and total to collect (COD + service)
  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    (async () => {
      try {
        const typeEnum = String(order.type) === 'express' ? PricingQuoteRequest.type.EXPRESS : PricingQuoteRequest.type.STANDARD;
        const body: any = {
          type: typeEnum,
          weight: order.weight,
          parcels: order.parcels,
        };
        if (typeof (order as any).dropoffLat === 'number' && typeof (order as any).dropoffLng === 'number') {
          body.lat = (order as any).dropoffLat;
          body.lng = (order as any).dropoffLng;
        } else if (order.zoneLevel) {
          body.zoneLevel =
            order.zoneLevel === 'ville'
              ? PricingQuoteRequest.zoneLevel.VILLE
              : order.zoneLevel === 'peripherie'
              ? PricingQuoteRequest.zoneLevel.PERIPHERIE
              : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
        }
        const quote = await api.pricing.postApiPricingQuote(body);
        if (cancelled) return;
        setSvcQuote({
          total: quote?.priceTotal ?? undefined,
          pickup: quote?.fees?.pickupFee ?? undefined,
          delivery: quote?.fees?.deliveryFee ?? undefined,
          express: quote?.fees?.expressSurcharge ?? undefined,
          manual: !!quote?.requiresManualHandling,
        });
      } catch (e) {
        if (!cancelled) setSvcQuote(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [order, api]);

  const assign = async () => {
    const raw = assignVal.trim();
    if (!raw) { showToast('Renseignez un ID ou un nom de livreur', 'error'); return; }
    setAssignBusy(true);
    try {
      let targetId: number | null = null;
      const asNum = Number(raw);
      if (!Number.isNaN(asNum)) {
        targetId = asNum;
      } else {
        // lookup by name among livreurs
        const res = await api.adminUsers.getApiAdminUsers('livreur', raw, 1, 5);
        const items = res.items ?? [];
        const exact = items.filter(u => (u.name ?? '').toLowerCase() === raw.toLowerCase());
        if (exact.length === 1) targetId = exact[0].id as number;
        else if (items.length === 1) targetId = items[0].id as number;
        else if (items.length > 1) { showToast(`Plusieurs livreurs trouvés pour "${raw}". Affinez la recherche.`, 'error'); return; }
        else { showToast(`Aucun livreur trouvé pour "${raw}"`, 'error'); return; }
      }
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: targetId });
      showToast('Commande assignée', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminOrderDetail] assign error', e?.body || e?.message || e);
      showToast(e?.body?.msg || 'Assignation échouée', 'error');
    } finally {
      setAssignBusy(false);
    }
  };

  // --- Admin OTP assistance (support) ---
  const [otpReqBusy, setOtpReqBusy] = useState(false);
  const [otpVerifyBusy, setOtpVerifyBusy] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const requestOtp = async (channel: OTPRequest['channel']) => {
    if (!Number.isFinite(orderId)) return;
    setOtpReqBusy(true);
    try {
      await api.deliveryOtp.postApiOrdersRequestOtp(orderId, { channel });
      showToast(`OTP envoyé (${channel.toUpperCase()})`, 'success');
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Demande OTP échouée';
      showToast(msg, 'error');
    } finally {
      setOtpReqBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!Number.isFinite(orderId)) return;
    const code = otpCode.trim();
    if (!/^\d{6}$/.test(code)) {
      showToast('Code OTP invalide (6 chiffres)', 'error');
      return;
    }
    setOtpVerifyBusy(true);
    try {
      await api.deliveryOtp.postApiOrdersVerifyOtp(orderId, { code });
      showToast('OTP vérifié', 'success');
      setOtpCode('');
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Vérification OTP échouée';
      showToast(msg, 'error');
    } finally {
      setOtpVerifyBusy(false);
    }
  };

  const unassign = async () => {
    setAssignBusy(true);
    try {
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: null });
      showToast('Assignation retirée', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminOrderDetail] unassign error', e?.body || e?.message || e);
      showToast(e?.body?.msg || 'Désassignation échouée', 'error');
    } finally {
      setAssignBusy(false);
    }
  };

  const setStatus = async (backendStatus: string) => {
    setStatusBusy(true);
    try {
      await api.orders.patchApiOrdersStatus(orderId, { status: backendStatus });
      showToast('Statut mis à jour', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminOrderDetail] status error', e?.body || e?.message || e);
      showToast(e?.body?.msg || 'Mise à jour du statut échouée', 'error');
    } finally {
      setStatusBusy(false);
    }
  };

  if (!Number.isFinite(orderId)) {
    return (
      <View className="flex-1 items-center justify-center bg-white"><Text>ID invalide</Text></View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#059669" />
        <Text className="text-slate-600 mt-2">Chargement…</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white"><Text>Commande introuvable</Text></View>
    );
  }

  const handleBack = () => {
    router.replace('/(admin)/orders' as any);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="px-4 pt-4 pb-4 border-b border-slate-200 bg-white">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-xl font-quicksand-bold text-slate-900">Commande #{order.id}</Text>
            <Text className="text-slate-500 mt-1 text-sm">{order.type?.toUpperCase()} · Statut: {statusLabel[mapBackendStatus(String(order.status))]}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleBack} 
            accessibilityLabel="Revenir à la liste des commandes"
            activeOpacity={0.7}
            className="flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-2 ml-3"
          >
            <Ionicons name="arrow-back" size={18} color="#0F172A" />
            <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="m-4 bg-white border border-slate-200 rounded-2xl p-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Détails</Text>
        {(() => { const o = order as any; return (
          <>
            <Text className="text-slate-700">Zone: {order.zoneLevel}</Text>
            <Text className="text-slate-700">Total: {o?.priceTotal ?? '—'} Ar</Text>
            <Text className="text-slate-700">Colis: {o?.category ?? '—'} · {order.weight} kg · x{order.parcels} · {o?.fragile ? 'Fragile' : '—'} · {o?.bulky ? 'Volumineux' : '—'}</Text>
            <Text className="text-slate-700">Service: {order.type?.toUpperCase()} · Retour: {o?.needReturn ? 'Oui' : 'Non'}</Text>
            {(o?.slotStart || o?.slotEnd) && (
              <Text className="text-slate-700">Créneau: {o?.slotStart || '—'} → {o?.slotEnd || '—'}</Text>
            )}
            {typeof o?.otpVerified === 'boolean' ? (
              <Text className="text-[12px] text-slate-500 mt-1">OTP: {o.otpVerified ? 'Vérifié' : 'Non vérifié'}</Text>
            ) : null}
          </>
        ); })()}
      </View>

      {/* Détail du prix */}
      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Détail du prix</Text>
        {(() => {
          const p = order as any;
          const pick = (...keys: string[]) => keys.map(k => p?.[k]).find(v => v !== undefined && v !== null);
          const amt = (v: any): number | undefined => {
            if (v === undefined || v === null) return undefined;
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
          };

          const rows: Array<{ label: string; value?: number }> = [
            { label: 'Montant à encaisser (COD)', value: amt(p.cashToCollect) },
            { label: 'Pickup', value: amt((svcQuote?.pickup ?? undefined) as any) },
            { label: 'Livraison', value: amt((svcQuote?.delivery ?? undefined) as any) },
            { label: 'Express', value: amt((svcQuote?.express ?? undefined) as any) },
            { label: 'Prix de base', value: amt(pick('priceBase','basePrice')) },
            { label: 'Zone', value: amt(pick('priceZone','zonePrice')) },
            { label: 'Poids', value: amt(pick('weightFee','weightPrice')) },
            { label: 'Volumineux', value: amt(pick('bulkyFee')) },
            { label: 'Fragile', value: amt(pick('fragileFee')) },
            { label: 'Distance', value: amt(pick('distanceFee')) },
            { label: 'Retour', value: amt(pick('returnFee')) },
            { label: 'Colis supplémentaires', value: amt(pick('parcelsFee')) },
            { label: 'TVA', value: amt(pick('vat')) },
            { label: 'Réduction', value: (() => { const d = pick('discount'); const n = amt(d); return n !== undefined ? -Math.abs(n) : undefined; })() },
          ];
          const present = rows.filter(r => r.value !== undefined);
          const serviceTotal = amt(svcQuote?.total);
          const cod = amt(p.cashToCollect) || 0;
          const totalToCollect = (serviceTotal ?? 0) + cod;
          if (present.length === 0 && serviceTotal === undefined) {
            return <Text className="text-slate-500">Aucun détail disponible</Text>;
          }
          return (
            <View>
              {present.map((r, idx) => (
                <View key={idx} className="flex-row justify-between py-1">
                  <Text className="text-slate-700">{r.label}</Text>
                  <Text className="text-slate-800">{r.value} Ar</Text>
                </View>
              ))}
              {serviceTotal !== undefined && (
                <View className="flex-row justify-between py-1 mt-1 border-t border-slate-200">
                  <Text className="text-slate-900 font-quicksand-bold">Frais de service (livraison)</Text>
                  <Text className="text-slate-900 font-quicksand-bold">{serviceTotal} Ar</Text>
                </View>
              )}
              {(serviceTotal !== undefined || cod > 0) && (
                <View className="flex-row justify-between py-1">
                  <Text className="text-slate-900 font-quicksand-bold">Total à encaisser (COD + service)</Text>
                  <Text className="text-slate-900 font-quicksand-bold">{totalToCollect} Ar</Text>
                </View>
              )}
            </View>
          );
        })()}
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Expéditeur</Text>
        {(() => { const o = order as any; return (
          <>
            <Text className="text-slate-700">{o?.pickupName ?? '—'} · {o?.pickupPhone ?? '—'}</Text>
            <Text className="text-slate-700 mt-1">{order.pickupAddress}</Text>
            {o?.pickupAddressDetail && (
              <Text className="text-slate-600 mt-1 text-sm">Détails: {o.pickupAddressDetail}</Text>
            )}
            <Text className="text-slate-500 mt-1 text-sm">Localité: {o?.pickupLocalityId ?? '—'}</Text>
          </>
        ); })()}
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Destinataire</Text>
        {(() => { const o = order as any; return (
          <>
            <Text className="text-slate-700">{o?.dropoffName ?? '—'} · {order.recipientPhone ?? '—'}{order.recipientEmail ? ` · ${order.recipientEmail}` : ''}</Text>
            <Text className="text-slate-700 mt-1">{order.dropoffAddress}</Text>
            {o?.dropoffAddressDetail && (
              <Text className="text-slate-600 mt-1 text-sm">Détails: {o.dropoffAddressDetail}</Text>
            )}
            <Text className="text-slate-500 mt-1 text-sm">Localité: {o?.dropoffLocalityId ?? '—'}</Text>
            {o?.notes ? <Text className="text-slate-700 mt-1">Notes: {o.notes}</Text> : null}
          </>
        ); })()}
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Assignation</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            placeholder="ID ou nom du livreur"
            keyboardType="default"
            value={assignVal}
            onChangeText={setAssignVal}
            accessibilityLabel={`Saisir l'ID ou le nom du livreur pour la commande #${order.id}`}
          />
          <TouchableOpacity className={`px-3 py-2 rounded-lg ${assignBusy ? 'bg-emerald-300' : 'bg-emerald-600'}`} disabled={assignBusy} onPress={assign} accessibilityLabel={`Assigner la commande #${order.id}`} accessibilityState={{ disabled: assignBusy }}>
            {assignBusy ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-white">Assigner</Text>}
          </TouchableOpacity>
          {order.assignedTo != null && (
            <TouchableOpacity className={`px-3 py-2 rounded-lg ${assignBusy ? 'bg-rose-300' : 'bg-rose-600'}`} disabled={assignBusy} onPress={unassign} accessibilityLabel={`Retirer l'assignation de la commande #${order.id}`} accessibilityState={{ disabled: assignBusy }}>
              {assignBusy ? <ActivityIndicator size="small" color="#ffffff" /> : <Text className="text-white">Retirer</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Statut</Text>
        <View className="flex-row flex-wrap gap-2">
          {(() => {
            const pipeline = ['en_cours_de_traitement','en_route_vers_recuperation','en_chemin','en_chemin_pour_livraison','expedie'];
            const cur = String(order.status);
            const idx = Math.max(0, pipeline.indexOf(cur));
            return pipeline.map((s, i) => {
              const isCurrent = i === idx;
              const isNext = i === idx + 1;
              const enabled = isNext && !statusBusy; // n'autorise que l'étape suivante
              const cls = enabled ? 'bg-emerald-600 border-emerald-700' : isCurrent ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-100 border-slate-300';
              const textCls = enabled ? 'text-white' : isCurrent ? 'text-emerald-700' : 'text-slate-400';
              return (
                <TouchableOpacity
                  key={s}
                  className={`px-3 py-2 rounded-full border ${cls}`}
                  disabled={!enabled}
                  onPress={() => enabled && setStatus(s)}
                  accessibilityState={{ disabled: !enabled }}
                >
                  <Text className={`${textCls} text-xs font-quicksand-bold`}>{s}</Text>
                </TouchableOpacity>
              );
            });
          })()}
        </View>
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Assistance OTP (Admin)</Text>
        <Text className="text-slate-600 mb-2">Utilisez uniquement en support au livreur/destinataire.</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity disabled={otpReqBusy} onPress={() => requestOtp(OTPRequest.channel.SMS)} className={`px-3 py-2 rounded-full border ${otpReqBusy ? 'bg-slate-100 border-slate-300' : 'bg-emerald-50 border-emerald-300'}`} accessibilityState={{ disabled: otpReqBusy }}>
            <Text className={`${otpReqBusy ? 'text-slate-400' : 'text-emerald-700'} text-xs font-quicksand-bold`}>Envoyer OTP (SMS)</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={otpReqBusy} onPress={() => requestOtp(OTPRequest.channel.EMAIL)} className={`px-3 py-2 rounded-full border ${otpReqBusy ? 'bg-slate-100 border-slate-300' : 'bg-emerald-50 border-emerald-300'}`} accessibilityState={{ disabled: otpReqBusy }}>
            <Text className={`${otpReqBusy ? 'text-slate-400' : 'text-emerald-700'} text-xs font-quicksand-bold`}>Envoyer OTP (Email)</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-3">
          <Text className="text-slate-700 mb-1">Vérifier un code</Text>
          <TextInput
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="ex: 123456"
            keyboardType="number-pad"
            className="border border-slate-300 rounded-lg px-3 py-2"
          />
          <View className="mt-2">
            <TouchableOpacity disabled={otpVerifyBusy || !/^\d{6}$/.test(otpCode)} onPress={verifyOtp} className={`self-start px-3 py-2 rounded-full border ${otpVerifyBusy || !/^\d{6}$/.test(otpCode) ? 'bg-slate-100 border-slate-300' : 'bg-emerald-50 border-emerald-300'}`} accessibilityState={{ disabled: otpVerifyBusy || !/^\d{6}$/.test(otpCode) }}>
              <Text className={`${otpVerifyBusy || !/^\d{6}$/.test(otpCode) ? 'text-slate-400' : 'text-emerald-700'} text-xs font-quicksand-bold`}>Vérifier OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
