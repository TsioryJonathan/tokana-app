import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getApiClient } from '@/lib/api/client';
import type { Order } from '@/lib/api/models/Order';
import { useToast } from '@/components/ui/Toast';
import { OTPRequest } from '@/lib/api/models/OTPRequest';

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

  const assign = async () => {
    const trimmed = assignVal.trim();
    const toId = trimmed ? Number(trimmed) : NaN;
    if (Number.isNaN(toId)) {
      showToast('ID livreur invalide', 'error');
      return;
    }
    setAssignBusy(true);
    try {
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: toId });
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

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-quicksand-bold text-slate-900">Commande #{order.id}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-emerald-700">Retour</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-slate-500 mt-1">{order.type?.toUpperCase()} · Statut: {String(order.status)}</Text>
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

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Expéditeur</Text>
        {(() => { const o = order as any; return (
          <Text className="text-slate-700">{o?.pickupName ?? '—'} · {o?.pickupPhone ?? '—'}</Text>
        ); })()}
        <Text className="text-slate-700">{order.pickupAddress}</Text>
        {(() => { const o = order as any; return (
          <Text className="text-slate-500">Localité: {o?.pickupLocalityId ?? '—'}</Text>
        ); })()}
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-4">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Destinataire</Text>
        {(() => { const o = order as any; return (
          <Text className="text-slate-700">{o?.dropoffName ?? '—'} · {order.recipientPhone ?? '—'}{order.recipientEmail ? ` · ${order.recipientEmail}` : ''}</Text>
        ); })()}
        <Text className="text-slate-700">{order.dropoffAddress}</Text>
        {(() => { const o = order as any; return (
          <>
            <Text className="text-slate-500">Localité: {o?.dropoffLocalityId ?? '—'}</Text>
            {o?.notes ? <Text className="text-slate-700 mt-1">Notes: {o.notes}</Text> : null}
          </>
        ); })()}
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Assignation</Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            placeholder="ID livreur"
            keyboardType="number-pad"
            value={assignVal}
            onChangeText={setAssignVal}
          />
          <TouchableOpacity className={`px-3 py-2 rounded-lg ${assignBusy ? 'bg-emerald-400' : 'bg-emerald-600'}`} disabled={assignBusy} onPress={assign}>
            <Text className="text-white">{assignBusy ? '...' : 'Assigner'}</Text>
          </TouchableOpacity>
          {order.assignedTo != null && (
            <TouchableOpacity className={`px-3 py-2 rounded-lg ${assignBusy ? 'bg-slate-300' : 'bg-slate-500'}`} disabled={assignBusy} onPress={unassign}>
              <Text className="text-white">Retirer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Statut</Text>
        <View className="flex-row flex-wrap gap-2">
          {['en_cours_de_traitement','en_route_vers_recuperation','en_chemin','en_chemin_pour_livraison','expedie'].map((s) => (
            <TouchableOpacity key={s} className={`px-3 py-2 rounded-full border ${statusBusy ? 'bg-slate-200 border-slate-300' : 'bg-slate-100 border-slate-300'}`} disabled={statusBusy} onPress={() => setStatus(s)}>
              <Text className="text-slate-700 text-xs font-quicksand-bold">{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mx-4 bg-white border border-slate-200 rounded-2xl p-4 mb-8">
        <Text className="font-quicksand-bold text-slate-900 mb-2">Assistance OTP (Admin)</Text>
        <Text className="text-slate-600 mb-2">Utilisez uniquement en support au livreur/destinataire.</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity disabled={otpReqBusy} onPress={() => requestOtp(OTPRequest.channel.SMS)} className={`px-3 py-2 rounded-full border ${otpReqBusy ? 'bg-slate-200 border-slate-300' : 'bg-slate-100 border-slate-300'}`}>
            <Text className="text-slate-700 text-xs font-quicksand-bold">Envoyer OTP (SMS)</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={otpReqBusy} onPress={() => requestOtp(OTPRequest.channel.EMAIL)} className={`px-3 py-2 rounded-full border ${otpReqBusy ? 'bg-slate-200 border-slate-300' : 'bg-slate-100 border-slate-300'}`}>
            <Text className="text-slate-700 text-xs font-quicksand-bold">Envoyer OTP (Email)</Text>
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
            <TouchableOpacity disabled={otpVerifyBusy || !/^\d{6}$/.test(otpCode)} onPress={verifyOtp} className={`self-start px-3 py-2 rounded-full border ${otpVerifyBusy || !/^\d{6}$/.test(otpCode) ? 'bg-slate-200 border-slate-300' : 'bg-slate-100 border-slate-300'}`}>
              <Text className="text-slate-700 text-xs font-quicksand-bold">Vérifier OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
