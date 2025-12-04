import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getApiClient } from '../../../lib/api/client';
import { useToast } from '../../../components/ui/Toast';
import type { User } from '../../../lib/api/models/User';
import { ApiError } from '../../../lib/api';
import { Calendar, Clock, ChevronLeft, Search, User as UserIcon, Package, MapPin, Phone, Mail } from 'lucide-react-native';

const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;
const normalizeLocalPhone = (input: string) => input.trim().replace(/[\s.\-()]/g, '');

const ZONES: { key: 'ville' | 'peripherie' | 'super-peripherie'; label: string }[] = [
  { key: 'ville', label: 'TANA Ville' },
  { key: 'peripherie', label: 'Périphérie' },
  { key: 'super-peripherie', label: 'Super Périphérie' },
];

export default function AdminNewOrderPage() {
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<User[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const [pickupAddress, setPickupAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');

  const [serviceType, setServiceType] = useState<'standard' | 'express'>('standard');
  const [zoneLevel, setZoneLevel] = useState<'ville' | 'peripherie' | 'super-peripherie'>('ville');
  const [weight, setWeight] = useState('');
  const [parcels, setParcels] = useState('1');
  const [needReturn, setNeedReturn] = useState(false);

  const [cashToCollect, setCashToCollect] = useState('');
  const [isPrepaid, setIsPrepaid] = useState(false);
  const [deliveryFeePrepaid, setDeliveryFeePrepaid] = useState(false);
  const [notes, setNotes] = useState('');

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<{ startISO: string; endISO: string }[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Load slots when service/zone change (standard only)
  useEffect(() => {
    const loadSlots = async () => {
      if (serviceType !== 'standard') {
        setSlots([]);
        setSelectedSlotIndex(null);
        return;
      }
      try {
        setSlotsLoading(true);
        const resp: any = await api.slots.getApiSlotsStandard(zoneLevel);
        const list = Array.isArray(resp) ? resp : resp?.slots;
        setSlots(Array.isArray(list) ? list : []);
        setSelectedSlotIndex(Array.isArray(list) && list.length > 0 ? 0 : null);
      } catch (e: any) {
        setSlots([]);
        setSelectedSlotIndex(null);
        showToast("Impossible de charger les créneaux", 'error');
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [api, serviceType, zoneLevel, showToast]);

  const searchClients = useCallback(async () => {
    if (!clientSearch.trim()) {
      setClientResults([]);
      return;
    }
    try {
      setClientLoading(true);
      const res = await api.adminUsers.getApiAdminUsers('client', clientSearch.trim(), 1, 10);
      setClientResults(res.items ?? []);
    } catch (e: any) {
      console.warn('[AdminNewOrder] searchClients error', e);
      const msg: string = e?.body?.msg || e?.message || 'Recherche client échouée';
      showToast(msg, 'error');
    } finally {
      setClientLoading(false);
    }
  }, [api, clientSearch, showToast]);

  const canSubmit = useMemo(() => {
    if (!selectedClient?.id) return false;
    if (!pickupAddress.trim()) return false;
    if (!dropoffAddress.trim()) return false;
    if (!recipientName.trim()) return false;
    const rPhone = normalizeLocalPhone(recipientPhone);
    if (!mgPhoneRegex.test(rPhone)) return false;
    const w = Number(weight.replace(',', '.'));
    if (!Number.isFinite(w) || w <= 0) return false;
    const p = Number(parcels);
    if (!Number.isFinite(p) || p < 1 || !Number.isInteger(p)) return false;
    if (serviceType === 'standard') {
      if (!slots.length || selectedSlotIndex == null) return false;
    }
    return true;
  }, [selectedClient, pickupAddress, dropoffAddress, recipientName, recipientPhone, weight, parcels, serviceType, slots, selectedSlotIndex]);

  const submit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);

      // If express, validate window
      if (serviceType === 'express') {
        const avail: any = await api.slots.getApiSlotsExpress();
        if (avail && avail.allowed === false) {
          showToast(avail.reason || 'Express indisponible pour le moment', 'error');
          setSubmitting(false);
          return;
        }
      }

      const w = Number(weight.replace(',', '.'));
      const p = Math.max(1, Number(parcels) || 1);
      const payload: any = {
        type: serviceType,
        zoneLevel,
        pickupAddress: pickupAddress.trim(),
        dropoffAddress: dropoffAddress.trim(),
        weight: w,
        parcels: p,
        cashToCollect: cashToCollect ? Math.max(0, Number(cashToCollect) || 0) : 0,
        recipientPhone: normalizeLocalPhone(recipientPhone),
        recipientEmail: recipientEmail.trim() || undefined,
        dropoffName: recipientName.trim() || undefined,
        notes: notes.trim() || undefined,
        needReturn,
        isPrepaid,
        deliveryFeePrepaid,
        createdByClientId: selectedClient?.id,
      };

      if (serviceType === 'standard' && slots.length && selectedSlotIndex != null) {
        const s = slots[selectedSlotIndex];
        payload.slotStart = s.startISO;
        payload.slotEnd = s.endISO;
      }

      const created = await api.orders.postApiOrders(payload);
      showToast('Commande créée', 'success');
      router.replace({ pathname: '/(admin)/orders' as any, params: { highlight: String(created.id) } });
    } catch (e: any) {
      console.warn('[AdminNewOrder] submit error', e?.status, e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Création échouée';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }, [api, canSubmit, submitting, serviceType, zoneLevel, pickupAddress, dropoffAddress, weight, parcels, cashToCollect, recipientPhone, recipientEmail, recipientName, notes, needReturn, selectedClient, slots, selectedSlotIndex, router, showToast]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-6 px-6"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            >
              <ChevronLeft size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-2xl font-clash-bold mb-1">Nouvelle commande</Text>
              <Text className="text-emerald-100 text-xs font-quicksand">
                Création de livraison au nom d&apos;un client
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-5">
          {/* Client selector */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-emerald-100 rounded-lg p-2">
                <UserIcon size={18} color="#059669" />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-base">Client expéditeur</Text>
            </View>
            <View className="relative mb-3">
              <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                <Search size={16} color="#94A3B8" />
              </View>
              <TextInput
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Recherche client (nom, email, téléphone)"
                className="border border-gray-200 rounded-xl px-10 py-3 bg-gray-50 font-quicksand"
                returnKeyType="search"
                onSubmitEditing={searchClients}
              />
            </View>
            <TouchableOpacity
              onPress={searchClients}
              activeOpacity={0.7}
              className="self-end px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 flex-row items-center gap-2"
            >
              {clientLoading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Search size={14} color="#059669" />
              )}
              <Text className="text-emerald-700 text-xs font-quicksand-semibold">Chercher</Text>
            </TouchableOpacity>
            {selectedClient && (
              <View className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <Text className="text-emerald-800 font-quicksand-semibold text-xs mb-1">Client sélectionné</Text>
                <Text className="text-emerald-900 font-quicksand-bold text-sm">{selectedClient.name || '(Sans nom)'}</Text>
                <Text className="text-emerald-800 text-xs">{selectedClient.phone || ''}</Text>
                {!!selectedClient.email && (
                  <Text className="text-emerald-800 text-xs">{selectedClient.email}</Text>
                )}
              </View>
            )}
            {clientResults.length > 0 && (
              <View className="mt-3 border border-gray-100 rounded-2xl max-h-56">
                <ScrollView>
                  {clientResults.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      onPress={() => {
                        setSelectedClient(u);
                        if (u.name) setPickupAddress(prev => prev || '');
                      }}
                      activeOpacity={0.7}
                      className="px-4 py-3 border-b border-gray-100 bg-white"
                    >
                      <Text className="text-gray-900 font-quicksand-semibold text-sm">{u.name || '(Sans nom)'}</Text>
                      <Text className="text-gray-700 text-xs">{u.phone || ''}</Text>
                      {!!u.email && (
                        <Text className="text-gray-500 text-xs">{u.email}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Addresses */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-sky-100 rounded-lg p-2">
                <MapPin size={18} color="#0284C7" />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-base">Adresses</Text>
            </View>
            <Text className="text-gray-700 text-xs font-quicksand-medium mb-1">Adresse de récupération</Text>
            <TextInput
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Adresse expéditeur (récupération)"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
              multiline
            />
            <Text className="text-gray-700 text-xs font-quicksand-medium mb-1">Adresse de livraison</Text>
            <TextInput
              value={dropoffAddress}
              onChangeText={setDropoffAddress}
              placeholder="Adresse destinataire"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
              multiline
            />
          </View>

          {/* Destinataire */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-purple-100 rounded-lg p-2">
                <UserIcon size={18} color="#7C3AED" />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-base">Destinataire</Text>
            </View>
            <TextInput
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Nom destinataire"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
            />
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                <Phone size={16} color="#64748B" />
                <TextInput
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  placeholder="Téléphone"
                  className="flex-1 ml-2 py-2 font-quicksand"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                <Mail size={16} color="#64748B" />
                <TextInput
                  value={recipientEmail}
                  onChangeText={setRecipientEmail}
                  placeholder="Email (optionnel)"
                  className="flex-1 ml-2 py-2 font-quicksand"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Service & colis */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-amber-100 rounded-lg p-2">
                <Package size={18} color="#D97706" />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-base">Service & colis</Text>
            </View>

            {/* Type */}
            <View className="flex-row gap-2 mb-3">
              {(['standard', 'express'] as const).map((t) => {
                const active = serviceType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setServiceType(t)}
                    activeOpacity={0.8}
                    className={`flex-1 rounded-xl overflow-hidden ${active ? '' : ''}`}
                  >
                    {active ? (
                      <LinearGradient colors={['#059669', '#047857']} className="py-2 items-center">
                        <Text className="text-white font-quicksand-semibold text-sm">
                          {t === 'standard' ? 'Standard (J+1)' : 'Express'}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View className="py-2 items-center bg-gray-50 border border-gray-200 rounded-xl">
                        <Text className="text-gray-700 font-quicksand-semibold text-sm">
                          {t === 'standard' ? 'Standard (J+1)' : 'Express'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Zone */}
            <Text className="text-gray-700 text-xs font-quicksand-medium mb-1">Zone</Text>
            <View className="flex-row gap-2 mb-3">
              {ZONES.map((z) => {
                const active = zoneLevel === z.key;
                return (
                  <TouchableOpacity
                    key={z.key}
                    onPress={() => setZoneLevel(z.key)}
                    activeOpacity={0.8}
                    className={`flex-1 rounded-xl overflow-hidden ${active ? '' : ''}`}
                  >
                    {active ? (
                      <LinearGradient colors={['#0EA5E9', '#0284C7']} className="py-2 items-center">
                        <Text className="text-white font-quicksand-semibold text-xs">{z.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View className="py-2 items-center bg-gray-50 border border-gray-200 rounded-xl">
                        <Text className="text-gray-700 font-quicksand-semibold text-xs">{z.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Weight & parcels */}
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-700 text-xs font-quicksand-medium mb-1">Poids (kg)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ex: 2.5"
                  keyboardType="decimal-pad"
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
                />
              </View>
              <View style={{ width: 100 }}>
                <Text className="text-gray-700 text-xs font-quicksand-medium mb-1">Colis</Text>
                <TextInput
                  value={parcels}
                  onChangeText={setParcels}
                  placeholder="1"
                  keyboardType="number-pad"
                  className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
                />
              </View>
            </View>

            {/* Need return */}
            <TouchableOpacity
              onPress={() => setNeedReturn((v) => !v)}
              activeOpacity={0.7}
              className="flex-row items-center gap-2 mb-2"
            >
              <View className={`w-5 h-5 rounded-md border ${needReturn ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                {needReturn && <View className="flex-1" />}
              </View>
              <Text className="text-gray-700 text-xs font-quicksand-medium">Retour nécessaire</Text>
            </TouchableOpacity>

            {/* Slots for standard */}
            {serviceType === 'standard' && (
              <View className="mt-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <Calendar size={16} color="#64748B" />
                  <Text className="text-gray-900 font-quicksand-semibold text-xs">Créneau de livraison</Text>
                </View>
                {slotsLoading ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#059669" />
                    <Text className="text-gray-500 text-xs font-quicksand">Chargement des créneaux…</Text>
                  </View>
                ) : slots.length === 0 ? (
                  <Text className="text-red-500 text-xs font-quicksand">Aucun créneau disponible pour cette zone.</Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {slots.map((s, idx) => {
                      const active = selectedSlotIndex === idx;
                      const start = new Date(s.startISO);
                      const end = new Date(s.endISO);
                      const label = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
                      return (
                        <TouchableOpacity
                          key={s.startISO + s.endISO}
                          onPress={() => setSelectedSlotIndex(idx)}
                          activeOpacity={0.8}
                          className="rounded-full overflow-hidden"
                        >
                          {active ? (
                            <LinearGradient colors={['#059669', '#047857']} className="px-3 py-1.5 flex-row items-center gap-1">
                              <Clock size={12} color="#FFFFFF" />
                              <Text className="text-white text-[11px] font-quicksand-semibold">{label}</Text>
                            </LinearGradient>
                          ) : (
                            <View className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full flex-row items-center gap-1">
                              <Clock size={12} color="#64748B" />
                              <Text className="text-gray-700 text-[11px] font-quicksand-semibold">{label}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Paiement */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-10">
            <Text className="text-gray-900 font-quicksand-bold text-base mb-3">Paiement & notes</Text>
            <TextInput
              value={cashToCollect}
              onChangeText={setCashToCollect}
              placeholder="Montant à encaisser (Ar) — 0 si prépayé"
              keyboardType="number-pad"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
            />
            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity
                onPress={() => setIsPrepaid((v) => !v)}
                activeOpacity={0.7}
                className="flex-row items-center gap-2"
              >
                <View className={`w-5 h-5 rounded-md border ${isPrepaid ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}
                />
                <Text className="text-gray-700 text-xs font-quicksand-medium">Commande prépayée</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeliveryFeePrepaid((v) => !v)}
                activeOpacity={0.7}
                className="flex-row items-center gap-2"
              >
                <View className={`w-5 h-5 rounded-md border ${deliveryFeePrepaid ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}
                />
                <Text className="text-gray-700 text-xs font-quicksand-medium">Frais de livraison déjà payés</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optionnel)"
              className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand"
              multiline
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute left-0 right-0 bottom-0 px-6 pb-6 pt-3 bg-white border-t border-gray-100">
        <TouchableOpacity
          disabled={!canSubmit || submitting}
          onPress={submit}
          activeOpacity={0.8}
          className={`rounded-full overflow-hidden ${!canSubmit || submitting ? 'opacity-60' : ''}`}
        >
          <LinearGradient colors={['#059669', '#047857']} className="py-3 items-center">
            <Text className="text-white font-quicksand-bold text-base">
              {submitting ? 'Création…' : 'Créer la commande'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text className="mt-2 text-[11px] text-gray-500 font-quicksand text-center">
          Les tarifs sont calculés automatiquement côté serveur selon la zone, le poids et le type de service.
        </Text>
      </View>
    </SafeAreaView>
  );
}
