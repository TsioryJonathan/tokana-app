import React, { useMemo, useState, useEffect } from "react";
import { HeaderBackground } from "../../../components/CreateOrder/RecapBackground";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "../../../lib/api/client";
import { useToast } from "../../../components/ui/Toast";
import { normalizeLocalPhone } from "../../../utils/phone";
import { toNumberSafe, formatAr } from "../../../utils/price.helper";
import { PricingQuoteRequest } from "../../../lib/api/models/PricingQuoteRequest";
import { COLORS } from "../../../theme/colors";
import Row from "../../../components/CreateOrder/Row";
import { useSavedContacts } from "../../../lib/hooks/useSavedContacts";

type Draft = {
  sender: { name: string; phone: string; address: string; adresseExacte?: string; remarks?: string };
  recipient: { name: string; phone: string; address: string; email?: string };
  parcel: { category: string; weightKg: string; fragile: boolean; bulky: boolean; parcelsCount: string; customDimensions?: string };
  service: { service: "STANDARD" | "EXPRESS"; distanceKmBracket: "<5" | "5-10" | "10-20"; needReturn: boolean };
  payment: { codAmountAr: string; notes?: string };
  pickupLatLng?: { lat: number; lng: number } | null;
  dropoffLatLng?: { lat: number; lng: number } | null;
  selectedPickupLocality?: { id: string; name: string } | null;
  selectedDropoffLocality?: { id: string; name: string; zoneLevel?: "ville" | "peripherie" | "super-peripherie" } | null;
};

function toZoneLevel(bracket: Draft["service"]["distanceKmBracket"]): "ville" | "peripherie" | "super-peripherie" {
  if (bracket === "<5") return "ville";
  if (bracket === "5-10") return "peripherie";
  return "super-peripherie";
}

export default function OrderRecapPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ draft?: string }>();
  const { showToast } = useToast();
  const api = useMemo(getApiClient, []);
  const { createContact } = useSavedContacts();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [quote, setQuote] = useState<{ total?: number; pickup?: number; delivery?: number; express?: number; manual?: boolean; instructions?: string | null; contactPhone?: string | null; inferredZone?: 'ville' | 'peripherie' | 'super-peripherie' | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSaveContactModal, setShowSaveContactModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Parse draft from URL
  useEffect(() => {
    try {
      if (!params?.draft) return;
      const parsed: Draft = JSON.parse(decodeURIComponent(String(params.draft)));
      setDraft(parsed);
    } catch (e) {
      showToast("Récap invalide", "error");
    } finally {
      setLoading(false);
    }
  }, [params?.draft, showToast]);

  // Fetch a fresh server quote to display
  useEffect(() => {
    (async () => {
      if (!draft) return;
      try {
        const zoneLevel = toZoneLevel(draft.service.distanceKmBracket);
        const typeEnum = draft.service.service === "EXPRESS" ? PricingQuoteRequest.type.EXPRESS : PricingQuoteRequest.type.STANDARD;
        const parcels = Math.max(1, toNumberSafe(draft.parcel.parcelsCount || "1"));
        const weight = toNumberSafe(draft.parcel.weightKg);
        if (!weight || weight <= 0) return;
        const body: any = { type: typeEnum, weight, parcels };
        const zoneEnum = zoneLevel === "ville" ? PricingQuoteRequest.zoneLevel.VILLE : zoneLevel === "peripherie" ? PricingQuoteRequest.zoneLevel.PERIPHERIE : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
        if (draft.dropoffLatLng) {
          body.lat = draft.dropoffLatLng.lat; body.lng = draft.dropoffLatLng.lng;
          // send fallback in case server inference fails
          body.zoneLevel = zoneEnum;
        } else {
          body.zoneLevel = zoneEnum;
        }
        const q = await api.pricing.postApiPricingQuote(body);
        setQuote({
          total: q?.priceTotal ?? undefined,
          pickup: q?.fees?.pickupFee ?? undefined,
          delivery: q?.fees?.deliveryFee ?? undefined,
          express: q?.fees?.expressSurcharge ?? undefined,
          manual: !!q?.requiresManualHandling,
          instructions: q?.instructions ?? null,
          contactPhone: (q as any)?.contactPhone ?? null,
          inferredZone: (q as any)?.inferredZone ?? null,
        });
      } catch (e) {
        // ignore quote errors in recap
      }
    })();
  }, [draft, api]);

  const confirm = async () => {
    if (!draft) return;
    if (submitting) return;
    // If manual handling, block
    if (quote?.manual) {
      showToast(quote.instructions || "Traitement manuel requis.", "info");
      return;
    }
    try {
      setSubmitting(true);
      const zoneLevel = quote?.inferredZone || toZoneLevel(draft.service.distanceKmBracket);
      const type = draft.service.service === "EXPRESS" ? "express" : "standard";
      // Optional slot selection for standard (pick first available)
      let slotStart: string | undefined; let slotEnd: string | undefined;
      if (type === "standard") {
        // `/api/slots/standard` requires only zoneLevel; extra query params (lat/lng) are rejected by Joi
        const slotsResp: any = await api.slots.getApiSlotsStandard(zoneLevel);
        const slots = Array.isArray(slotsResp) ? slotsResp : slotsResp?.slots;
        if (!Array.isArray(slots) || slots.length === 0) {
          showToast("Aucun créneau standard disponible", "error");
          setSubmitting(false);
          return;
        }
        slotStart = slots[0].startISO; slotEnd = slots[0].endISO;
      } else {
        // Express availability check
        const avail = await api.slots.getApiSlotsExpress();
        if (avail && avail.allowed === false) {
          showToast(avail.reason || "Express indisponible", "error");
          setSubmitting(false);
          return;
        }
      }

      const parcelsCount = Math.max(1, toNumberSafe(draft.parcel.parcelsCount || "1"));
      const orderPayload: any = {
        type,
        pickupAddress: draft.sender.address.trim(),
        pickupName: draft.sender.name.trim() || undefined,
        pickupPhone: normalizeLocalPhone(draft.sender.phone) || undefined,
        pickupAddressDetail: draft.sender.adresseExacte?.trim() || undefined,
        dropoffAddress: (draft.recipient.address || '').trim() || (draft.selectedDropoffLocality?.name ?? ''),
        dropoffName: draft.recipient.name.trim() || undefined,
        category: draft.parcel.category,
        customDimensions: draft.parcel.customDimensions?.trim() || undefined,
        fragile: !!draft.parcel.fragile,
        bulky: !!draft.parcel.bulky,
        weight: toNumberSafe(draft.parcel.weightKg),
        parcels: parcelsCount,
        cashToCollect: Math.max(0, toNumberSafe(draft.payment.codAmountAr) || 0),
        notes: (draft.payment.notes || '').trim() || undefined,
        senderRemarks: draft.sender.remarks?.trim() || undefined,
        recipientPhone: normalizeLocalPhone(draft.recipient.phone) || undefined,
        recipientEmail: draft.recipient.email?.trim() || undefined,
        needReturn: !!draft.service.needReturn,
        slotStart,
        slotEnd,
        ...(draft.selectedDropoffLocality ? { dropoffLocalityId: draft.selectedDropoffLocality.id } : {}),
        ...(draft.dropoffLatLng ? { dropoffLat: draft.dropoffLatLng.lat, dropoffLng: draft.dropoffLatLng.lng } : {}),
        zoneLevel,
      };

      const created = await api.orders.postApiOrders(orderPayload as any);
      showToast("Commande créée", "success");
      
      // Proposer de sauvegarder les contacts
      setCreatedOrderId(created.id || null);
      setShowSaveContactModal(true);
    } catch (e: any) {
      // Surface server error message to the user for better diagnosis (Joi/business errors)
      let msg = e?.body?.msg || e?.message || "Création échouée";
      console.log('[recap] Erreur création commande:', e?.status, msg, e?.body);
      
      // Normaliser le message d'erreur : remplacer "Téléphone non vérifié" par "Email non vérifié"
      // (au cas où le serveur n'a pas été redémarré et utilise encore l'ancien code)
      if (msg.includes('Téléphone non vérifié') || msg.includes('téléphone non vérifié')) {
        msg = msg.replace(/téléphone non vérifié/i, 'Email non vérifié');
      }
      
      // Si l'erreur est liée à la vérification (email ou téléphone), rediriger vers la page de vérification
      if (e?.status === 403 && (msg.includes('non vérifié') || msg.includes('vérifié'))) {
        showToast("Veuillez vérifier votre email avant de créer une commande", "error");
        setTimeout(() => {
          router.replace("/(auth)/verify" as any);
        }, 1500);
        return;
      }
      
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Chargement…</Text>
      </View>
    );
  }
  const handleBack = () => {
    router.replace('/(client)/orders/new' as any);
  };

  if (!draft) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg font-quicksand-bold text-slate-900">Récap introuvable</Text>
        <TouchableOpacity 
          onPress={handleBack} 
          className="mt-4 bg-gray-100 rounded-full px-6 py-3 flex-row items-center gap-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#0F172A" />
          <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const zone = (quote?.inferredZone as any) || toZoneLevel(draft.service.distanceKmBracket);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <HeaderBackground source={require("../../../assets/images/recap-bg.png")} height={300} opacity={0.7} />

      <View className="pt-4 pb-2 border-b border-slate-50 overflow-hidden">
        <View className="pb-5">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            className="mb-3 flex-row items-center gap-2 bg-white/80 rounded-full px-4 py-2 self-start"
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textMain} />
            <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
          </TouchableOpacity>
          <View className="">
            <Text className="text-4xl font-quicksand-bold text-slate-900">
              05<Text className="text-2xl text-slate-400">/05</Text>
            </Text>
            <Text className="text-[25px] mt-1 text-slate-600">Confirmation</Text>
          </View>
        </View>
      </View>

        {/* Sender information */}
        <Text className="text-[16px] text-slate-900 mb-2 font-quicksand-semibold">Informations expéditeur</Text>
        <View className="bg-white rounded-2xl border border-slate-200 p-4">
          <Row label="Nom" value={draft.sender.name || '—'} />
          <Row label="Téléphone" value={draft.sender.phone || '—'} />
          <Row label="Adresse" value={draft.sender.address || '—'} multiline={true} />
        </View>

        {/* Recipient information */}
        <Text className="text-[16px] text-slate-900 mt-4 font-quicksand-semibold">Informations destinataire</Text>
        <View className="mt-2 bg-white rounded-2xl border border-slate-200 p-4">
          <Row label="Nom" value={draft.recipient.name || '—'} />
          <Row label="Téléphone" value={draft.recipient.phone || '—'} />
          <Row label="Adresse" value={draft.recipient.address || draft.selectedDropoffLocality?.name || '—'} multiline={true} />
        </View>

        {/* Details card (type, weight, parcels, category, service, estimated price) */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Row label="Type" value={draft.parcel.fragile ? 'Fragile' : draft.parcel.bulky ? 'Volumineux' : 'Standard'} />
          <Row label="Poids" value={`${draft.parcel.weightKg || '—'} kg`} />
          <Row label="Nombre" value={`${draft.parcel.parcelsCount || '1'}`} />
          <Row label="Catégorie" value={draft.parcel.category || '—'} />
          <Row label="Service" value={draft.service.service === 'EXPRESS' ? 'Express' : 'Standard'} />
          <Row 
            label="Zone" 
            value={
              quote?.inferredZone 
                ? `${quote.inferredZone === 'ville' ? 'Ville' : quote.inferredZone === 'peripherie' ? 'Périphérie' : 'Super Périphérie'} (détectée automatiquement)`
                : zone
            } 
          />
          {toNumberSafe(draft.payment.codAmountAr) > 0 && (
            <Row label="Encaissement (COD)" value={`${formatAr(toNumberSafe(draft.payment.codAmountAr))}`} />
          )}
          {draft.payment.notes && draft.payment.notes.trim() && (
            <Row label="Notes" value={draft.payment.notes} multiline={true} />
          )}
          <View className="mt-1 flex-row items-center justify-between">
            <Text className="text-slate-500">Prix estimé</Text>
            {quote?.manual ? (
              <Text className="text-[12px] text-amber-700">{quote.instructions || 'Traitement manuel requis.'}</Text>
            ) : quote?.total != null ? (
              <Text className="text-xl font-quicksand-bold" style={{ color: '#EF4444' }}>{formatAr(quote.total)}</Text>
            ) : (
              <Text className="text-slate-500 text-[12px]">Indisponible</Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View className="mt-5">
          <TouchableOpacity
            onPress={confirm}
            activeOpacity={0.9}
            disabled={submitting || !!quote?.manual}
            className={`w-full px-5 py-3 rounded-full ${submitting || quote?.manual ? 'bg-yellow-300' : 'bg-yellow-400'}`}
          >
            <Text className="text-center text-white font-quicksand-bold">{submitting ? 'Traitement…' : 'Confirmer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: "/orders/new" as any, params: { draft: encodeURIComponent(JSON.stringify(draft)) } })}
            activeOpacity={0.9}
            className="w-full px-5 py-3 rounded-full mt-3 border border-yellow-400"
          >
            <Text className="text-center font-quicksand-bold" style={{ color: '#CA8A04' }}>Étape précédente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de sauvegarde des contacts */}
      <Modal
        visible={showSaveContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSaveContactModal(false);
          if (createdOrderId) {
            router.replace({ pathname: "/tracking/[id]" as any, params: { id: String(createdOrderId) } });
          }
        }}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <Text className="text-xl font-quicksand-bold text-slate-900 mb-2">
              Sauvegarder les contacts ?
            </Text>
            <Text className="text-sm text-slate-600 font-quicksand mb-6">
              Voulez-vous sauvegarder l'expéditeur et le destinataire pour vos prochaines commandes ?
            </Text>

            <View className="gap-3">
              {/* Sauvegarder expéditeur */}
              <TouchableOpacity
                onPress={async () => {
                  if (!draft) return;
                  const success = await createContact({
                    type: 'sender',
                    name: draft.sender.name,
                    phone: draft.sender.phone,
                    address: draft.sender.address,
                    addressDetail: draft.sender.adresseExacte,
                  });
                  if (success) {
                    showToast('Expéditeur sauvegardé', 'success');
                  }
                }}
                activeOpacity={0.7}
                className="bg-[#FFD700] rounded-2xl py-3 px-4"
              >
                <Text className="text-center font-quicksand-bold text-slate-900">
                  Sauvegarder l'expéditeur
                </Text>
              </TouchableOpacity>

              {/* Sauvegarder destinataire */}
              <TouchableOpacity
                onPress={async () => {
                  if (!draft) return;
                  const success = await createContact({
                    type: 'recipient',
                    name: draft.recipient.name,
                    phone: draft.recipient.phone,
                    address: draft.recipient.address,
                    email: draft.recipient.email,
                  });
                  if (success) {
                    showToast('Destinataire sauvegardé', 'success');
                  }
                }}
                activeOpacity={0.7}
                className="bg-[#FFD700] rounded-2xl py-3 px-4"
              >
                <Text className="text-center font-quicksand-bold text-slate-900">
                  Sauvegarder le destinataire
                </Text>
              </TouchableOpacity>

              {/* Sauvegarder les deux */}
              <TouchableOpacity
                onPress={async () => {
                  if (!draft) return;
                  const senderSuccess = await createContact({
                    type: 'sender',
                    name: draft.sender.name,
                    phone: draft.sender.phone,
                    address: draft.sender.address,
                    addressDetail: draft.sender.adresseExacte,
                  });
                  const recipientSuccess = await createContact({
                    type: 'recipient',
                    name: draft.recipient.name,
                    phone: draft.recipient.phone,
                    address: draft.recipient.address,
                    email: draft.recipient.email,
                  });
                  if (senderSuccess && recipientSuccess) {
                    showToast('Contacts sauvegardés', 'success');
                  }
                  setShowSaveContactModal(false);
                  if (createdOrderId) {
                    router.replace({ pathname: "/tracking/[id]" as any, params: { id: String(createdOrderId) } });
                  }
                }}
                activeOpacity={0.7}
                className="bg-emerald-600 rounded-2xl py-3 px-4"
              >
                <Text className="text-center font-quicksand-bold text-white">
                  Sauvegarder les deux
                </Text>
              </TouchableOpacity>

              {/* Passer */}
              <TouchableOpacity
                onPress={() => {
                  setShowSaveContactModal(false);
                  if (createdOrderId) {
                    router.replace({ pathname: "/tracking/[id]" as any, params: { id: String(createdOrderId) } });
                  }
                }}
                activeOpacity={0.7}
                className="bg-slate-100 rounded-2xl py-3 px-4"
              >
                <Text className="text-center font-quicksand-semibold text-slate-700">
                  Passer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
