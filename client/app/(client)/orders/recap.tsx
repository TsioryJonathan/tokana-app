import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { normalizeLocalPhone } from "@/utils/phone";
import { toNumberSafe, formatAr } from "@/utils/price.helper";
import { PricingQuoteRequest } from "@/lib/api/models/PricingQuoteRequest";
import { COLORS } from "@/theme/colors";

type Draft = {
  sender: { name: string; phone: string; address: string };
  recipient: { name: string; phone: string; address: string; email?: string };
  parcel: { category: string; weightKg: string; fragile: boolean; bulky: boolean; parcelsCount: string };
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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [quote, setQuote] = useState<{ total?: number; pickup?: number; delivery?: number; express?: number; manual?: boolean; instructions?: string | null; contactPhone?: string | null; inferredZone?: 'ville' | 'peripherie' | 'super-peripherie' | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        if (draft.dropoffLatLng) {
          body.lat = draft.dropoffLatLng.lat; body.lng = draft.dropoffLatLng.lng;
        } else {
          body.zoneLevel = zoneLevel === "ville" ? PricingQuoteRequest.zoneLevel.VILLE : zoneLevel === "peripherie" ? PricingQuoteRequest.zoneLevel.PERIPHERIE : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
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
        let slotsResp: any;
        if (draft.dropoffLatLng) {
          slotsResp = await api.slots.getApiSlotsStandard(undefined, draft.dropoffLatLng.lat, draft.dropoffLatLng.lng);
        } else {
          slotsResp = await api.slots.getApiSlotsStandard(zoneLevel);
        }
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
        dropoffAddress: (draft.recipient.address || '').trim() || (draft.selectedDropoffLocality?.name ?? ''),
        dropoffName: draft.recipient.name.trim() || undefined,
        category: draft.parcel.category,
        fragile: !!draft.parcel.fragile,
        bulky: !!draft.parcel.bulky,
        weight: toNumberSafe(draft.parcel.weightKg),
        parcels: parcelsCount,
        cashToCollect: Math.max(0, toNumberSafe(draft.payment.codAmountAr) || 0),
        notes: (draft.payment.notes || '').trim() || undefined,
        recipientPhone: normalizeLocalPhone(draft.recipient.phone) || undefined,
        recipientEmail: draft.recipient.email?.trim() || undefined,
        needReturn: !!draft.service.needReturn,
        slotStart,
        slotEnd,
        ...(draft.selectedDropoffLocality ? { dropoffLocalityId: draft.selectedDropoffLocality.id } : {}),
        ...(draft.pickupLatLng ? { pickupLat: draft.pickupLatLng.lat, pickupLng: draft.pickupLatLng.lng } : {}),
        ...(draft.dropoffLatLng ? { dropoffLat: draft.dropoffLatLng.lat, dropoffLng: draft.dropoffLatLng.lng } : {}),
        zoneLevel,
      };

      const created = await api.orders.postApiOrders(orderPayload as any);
      showToast("Commande créée", "success");
      router.replace({ pathname: "/tracking/[id]" as any, params: { id: String(created.id) } });
    } catch (e) {
      showToast("Création échouée", "error");
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
  if (!draft) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg font-quicksand-bold text-slate-900">Récap introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-3">
          <Text className="text-emerald-600">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const zone = (quote?.inferredZone as any) || toZoneLevel(draft.service.distanceKmBracket);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-quicksand-bold text-slate-900 flex-1">Récapitulatif</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {/* Devis */}
        <View className="bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Devis</Text>
          {quote?.manual ? (
            <Text className="text-[12px] text-amber-700">{quote.instructions || "Traitement manuel requis."}</Text>
          ) : quote?.total != null ? (
            <Text className="text-xl font-quicksand-bold text-emerald-700">{formatAr(quote.total)}</Text>
          ) : (
            <Text className="text-[12px] text-slate-500">Devis indisponible</Text>
          )}
          {quote && !quote.manual && (
            <Text className="mt-0.5 text-[11px] text-slate-500">
              {`Pickup: ${quote.pickup ? formatAr(quote.pickup) : '—'} · Livraison: ${quote.delivery ? formatAr(quote.delivery) : '—'} · Express: ${quote.express ? formatAr(quote.express) : '—'}`}
            </Text>
          )}
          <Text className="mt-0.5 text-[11px] text-slate-500">Zone: {zone}</Text>
        </View>

        {/* Expéditeur */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Expéditeur</Text>
          <Text className="font-quicksand-semibold text-slate-800">{draft.sender.name} - {draft.sender.phone}</Text>
          <Text className="text-slate-700">{draft.sender.address}</Text>
        </View>

        {/* Destinataire */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Destinataire</Text>
          <Text className="font-quicksand-semibold text-slate-800">{draft.recipient.name} - {draft.recipient.phone}</Text>
          <Text className="text-slate-700">{draft.recipient.address || draft.selectedDropoffLocality?.name}</Text>
          {draft.recipient.email ? (
            <Text className="text-slate-700">{draft.recipient.email}</Text>
          ) : null}
        </View>

        {/* Colis */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Colis</Text>
          <Text className="text-slate-800">Catégorie: {draft.parcel.category}</Text>
          <Text className="text-slate-800">Poids: {draft.parcel.weightKg} kg</Text>
          <Text className="text-slate-800">Nombre: {draft.parcel.parcelsCount}</Text>
          <Text className="text-slate-800">Fragile: {draft.parcel.fragile ? "Oui" : "Non"} · Volumineux: {draft.parcel.bulky ? "Oui" : "Non"}</Text>
        </View>

        {/* Service */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Service</Text>
          <Text className="text-slate-800">Type: {draft.service.service === "EXPRESS" ? "Express" : "Standard"}</Text>
          <Text className="text-slate-800">Distance: {draft.service.distanceKmBracket} km</Text>
          <Text className="text-slate-800">Retour requis: {draft.service.needReturn ? "Oui" : "Non"}</Text>
        </View>

        {/* Paiement */}
        <View className="mt-3 bg-white rounded-2xl border border-slate-200 p-4">
          <Text className="text-[12px] text-slate-500">Paiement</Text>
          <Text className="text-slate-800">Encaissement à livraison (COD): {toNumberSafe(draft.payment.codAmountAr) > 0 ? formatAr(toNumberSafe(draft.payment.codAmountAr)) : "—"}</Text>
          {draft.payment.notes ? (<Text className="text-slate-800">Notes: {draft.payment.notes}</Text>) : null}
        </View>

        {/* Actions */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={confirm}
            activeOpacity={0.9}
            disabled={submitting}
            className={`w-full px-5 py-3 rounded-xl ${submitting ? "bg-emerald-300" : "bg-emerald-600"}`}
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-quicksand-bold mr-1">{submitting ? "Création…" : "Confirmer la commande"}</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9} className="w-full px-4 py-3 rounded-xl bg-slate-200 mt-2">
            <Text className="text-center font-quicksand-bold text-slate-800">Modifier</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
