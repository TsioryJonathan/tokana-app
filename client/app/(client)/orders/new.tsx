import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { PricingQuoteRequest } from "@/lib/api/models/PricingQuoteRequest";
import { useToast } from "@/components/ui/Toast";
import FirstStep from "@/components/CreateOrder/FirstStep";
import SecondStep from "@/components/CreateOrder/SecondStep";
import ThirdStep from "@/components/CreateOrder/ThirdStep";
import FourthStep from "@/components/CreateOrder/FourthStep";
import FifthStep from "@/components/CreateOrder/FifthStep";
import {
  ParcelState,
  PaymentState,
  RecipientState,
  SenderState,
  ServiceState,
} from "@/types/createorder.type";
import { formatAr, toNumberSafe } from "@/utils/price.helper";
import type { LocalityItem } from "@/lib/hooks/useLocalities";
import { LocalitySelector } from "@/components/CreateOrder/LocalitySelector";
import OrderReviewModal from "@/components/CreateOrder/OrderReviewModal";
import { normalizeLocalPhone } from "@/utils/phone";
import AddressAutocomplete from "@/components/AddressAutocomplete";

/* INITIAL STATES */
const INITIAL_PARCEL: ParcelState = {
  category: "SMALL",
  weightKg: "",
  fragile: false,
  bulky: false,
  parcelsCount: "1",
};
const INITIAL_SENDER: SenderState = { name: "", phone: "", address: "" };
const INITIAL_RECIPIENT: RecipientState = { name: "", phone: "", address: "", email: "" };
const INITIAL_SERVICE: ServiceState = {
  service: "STANDARD",
  distanceKmBracket: "<5",
  needReturn: false,
};
const INITIAL_PAYMENT: PaymentState = { codAmountAr: "", notes: "" };

const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;

const steps = [
  "Expéditeur",
  "Destinataire",
  "Colis",
  "Service",
  "Paiement",
] as const;
type Step = 0 | 1 | 2 | 3 | 4;

export default function NewOrderWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(0);
  const [parcel, setParcel] = useState<ParcelState>(INITIAL_PARCEL);
  const [sender, setSender] = useState<SenderState>(INITIAL_SENDER);
  const [recipient, setRecipient] = useState<RecipientState>(INITIAL_RECIPIENT);
  const [service, setService] = useState<ServiceState>(INITIAL_SERVICE);
  const [payment, setPayment] = useState<PaymentState>(INITIAL_PAYMENT);
  const [submitting, setSubmitting] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [serverQuote, setServerQuote] = useState<{
    total?: number;
    pickup?: number;
    delivery?: number;
    express?: number;
    manual?: boolean;
    instructions?: string | null;
    contactPhone?: string | null;
    inferredZone?: 'ville' | 'peripherie' | 'super-peripherie' | null;
  } | null>(null);
  const [expressEta, setExpressEta] = useState<{ min: number; max: number } | null>(null);
  const [showReview, setShowReview] = useState(false);
  // Local estimation removed to avoid confusion; we rely solely on server quote
  // API client
  const api = useMemo(getApiClient, []);

  // Locality selection
  const [selectedPickupLocality, setSelectedPickupLocality] = useState<LocalityItem | null>(null);
  const [selectedDropoffLocality, setSelectedDropoffLocality] = useState<LocalityItem | null>(null);
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffLatLng, setDropoffLatLng] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!selectedDropoffLocality) return;
    const z = selectedDropoffLocality.zoneLevel;
    const bracket = z === 'ville' ? '<5' : z === 'peripherie' ? '5-10' : '10-20';
    setService((s) => ({ ...s, distanceKmBracket: bracket }));
  }, [selectedDropoffLocality]);

  const toZoneLevel = (bracket: ServiceState["distanceKmBracket"]): "ville" | "peripherie" | "super-peripherie" => {
    if (bracket === "<5") return "ville";
    if (bracket === "5-10") return "peripherie";
    return "super-peripherie";
  };

  // Fetch real-time server quote when inputs change (zone/type/weight/parcels)
  React.useEffect(() => {
    // Only fetch quote when we have weight (step 2 and beyond)
    const zoneLevel = toZoneLevel(service.distanceKmBracket);
    const type = service.service === "EXPRESS" ? "express" : "standard";
    const parcelsCount = Math.max(1, toNumberSafe(parcel.parcelsCount || "1"));
    const weight = toNumberSafe(parcel.weightKg);
    
    // Don't fetch quote if no weight or no dropoff address selected
    if (!weight || weight <= 0 || !dropoffLatLng) {
      setServerQuote(null);
      setQuoteError(null);
      return;
    }
    
    let cancelled = false;
    (async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const typeEnum =
          type === "express"
            ? PricingQuoteRequest.type.EXPRESS
            : PricingQuoteRequest.type.STANDARD;
        const body: any = {
          type: typeEnum,
          weight,
          parcels: parcelsCount,
          lat: dropoffLatLng.lat,
          lng: dropoffLatLng.lng,
        };
        const quote = await api.pricing.postApiPricingQuote(body);
        if (cancelled) return;
        setServerQuote({
          total: quote?.priceTotal ?? undefined,
          pickup: quote?.fees?.pickupFee ?? undefined,
          delivery: quote?.fees?.deliveryFee ?? undefined,
          express: quote?.fees?.expressSurcharge ?? undefined,
          manual: !!quote?.requiresManualHandling,
          instructions: quote?.instructions ?? null,
          contactPhone: (quote as any)?.contactPhone ?? null,
          inferredZone: (quote as any)?.inferredZone ?? null,
        });
      } catch (e: any) {
        if (cancelled) return;
        setServerQuote(null);
        setQuoteError(e?.body?.msg || e?.message || "Devis indisponible");
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, service.distanceKmBracket, service.service, parcel.weightKg, parcel.parcelsCount, dropoffLatLng]);

  const validateCurrent = (): string[] => {
    const errs: string[] = [];
    if (step === 0) {
      // Sender validation
      if (!sender.name.trim()) errs.push("Nom expéditeur requis");
      const sPhone = normalizeLocalPhone(sender.phone);
      if (!mgPhoneRegex.test(sPhone)) errs.push("Téléphone expéditeur invalide");
      if (!sender.address.trim()) errs.push("Adresse expéditeur requise");
      if (!pickupLatLng) errs.push("Sélectionnez une suggestion d'adresse pour l'adresse de collecte");
    }
    if (step === 1) {
      // Recipient validation
      if (!recipient.name.trim()) errs.push("Nom destinataire requis");
      const rPhone = normalizeLocalPhone(recipient.phone);
      if (!mgPhoneRegex.test(rPhone)) errs.push("Téléphone destinataire invalide");
      if (!dropoffLatLng) errs.push("Sélectionnez une suggestion d'adresse pour l'adresse de livraison");
    }
    if (step === 2) {
      // Parcel validation
      if (toNumberSafe(parcel.weightKg) <= 0)
        errs.push("Poids du colis invalide");
      const n = toNumberSafe(parcel.parcelsCount || "1");
      if (!Number.isFinite(n) || n < 1 || Math.floor(n) !== n)
        errs.push("Nombre de colis doit être un entier ≥ 1");
    }
    // Étape 3 (Service): validation si nécessaire
    // Étape 4 (Paiement): non bloquante
    return errs;
  };

  const goNext = () => {
    const errs = validateCurrent();
    if (errs.length) {
      showToast(errs.join("\n"), "error");
      return;
    }
    if (step < steps.length - 1) setStep((s) => (s + 1) as Step);
    else setShowReview(true);
  };
  const goPrev = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
    else router.back();
  };
  const submit = async () => {
    if (submitting) return; // debounce
    const errs = validateCurrent();
    if (errs.length) {
      showToast(errs.join("\n"), "error");
      return;
    }
    // Optional quote validation
    // if (quoteLoading) {
    //   showToast("Calcul du devis en cours…", "info");
    //   return;
    // }
    // if (!serverQuote || serverQuote.total == null) {
    //   showToast("Devis indisponible. Vérifie le poids, la zone et réessaie.", "error");
    //   return;
    // }
    // if (serverQuote.manual) {
    //   showToast(serverQuote.instructions || "Traitement manuel requis. Contactez le support.", "info");
    //   return;
    // }
    try {
      setSubmitting(true);
      const zoneLevel = toZoneLevel(service.distanceKmBracket);
      const type = service.service === "EXPRESS" ? "express" : "standard";
      let slotStart: string | undefined;
      let slotEnd: string | undefined;
      const parcelsCount = Math.max(1, toNumberSafe(parcel.parcelsCount || "1"));

      // 1) Express availability check
      if (type === "express") {
        try {
          const avail = await api.slots.getApiSlotsExpress();
          if (avail && avail.allowed === false) {
            showToast(avail.reason || "Express indisponible", "error");
            return;
          }
          if (avail && typeof (avail as any).eta?.minMinutes === "number" && typeof (avail as any).eta?.maxMinutes === "number") {
            setExpressEta({ min: (avail as any).eta.minMinutes, max: (avail as any).eta.maxMinutes });
          } else {
            setExpressEta({ min: 60, max: 120 });
          }
        } catch (e) {
          console.warn("express availability failed", e);
          // Conserver une UX stricte: bloquer si indisponible/inconnue
          showToast("Vérification express indisponible", "error");
          return;
        }
      }

      // 2) Standard slot required
      if (type === "standard") {
        try {
          let slotsResp: any;
          if (dropoffLatLng) {
            slotsResp = await api.slots.getApiSlotsStandard(undefined, dropoffLatLng.lat, dropoffLatLng.lng);
          } else {
            slotsResp = await api.slots.getApiSlotsStandard(zoneLevel);
          }
          const slots = Array.isArray(slotsResp) ? slotsResp : slotsResp?.slots;
          if (!Array.isArray(slots) || slots.length === 0) {
            showToast("Aucun créneau standard disponible", "error");
            return;
          }
          slotStart = slots[0].startISO;
          slotEnd = slots[0].endISO;
        } catch (e) {
          console.warn("slots fetch failed", e);
          showToast("Créneaux indisponibles", "error");
          return;
        }
      }

      // 3) Pricing quote (alignement backend)
      try {
        const typeEnum =
          type === "express"
            ? PricingQuoteRequest.type.EXPRESS
            : PricingQuoteRequest.type.STANDARD;
        const body: any = {
          type: typeEnum,
          weight: toNumberSafe(parcel.weightKg),
          parcels: parcelsCount,
        };
        if (dropoffLatLng) {
          body.lat = dropoffLatLng.lat;
          body.lng = dropoffLatLng.lng;
        } else {
          const zoneEnum =
            zoneLevel === "ville"
              ? PricingQuoteRequest.zoneLevel.VILLE
              : zoneLevel === "peripherie"
              ? PricingQuoteRequest.zoneLevel.PERIPHERIE
              : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
          body.zoneLevel = zoneEnum;
        }
        const quote = await api.pricing.postApiPricingQuote(body);
        if (quote?.requiresManualHandling) {
          showToast(
            quote.instructions ||
              "Traitement manuel requis. Merci de contacter le support.",
            "info"
          );
          return;
        }
      } catch (e) {
        console.warn("pricing quote failed", e);
        showToast("Devis indisponible", "error");
        return;
      }

      const cleanedSenderPhone = normalizeLocalPhone(sender.phone);
      const cleanedRecipientPhone = normalizeLocalPhone(recipient.phone);
      const orderPayload: any = {
        type,
        pickupAddress: sender.address.trim(),
        pickupName: sender.name.trim() || undefined,
        pickupPhone: cleanedSenderPhone || undefined,
        dropoffAddress: (recipient.address || '').trim() || (selectedDropoffLocality?.name ?? ''),
        dropoffName: recipient.name.trim() || undefined,
        category: parcel.category,
        fragile: !!parcel.fragile,
        bulky: !!parcel.bulky,
        weight: toNumberSafe(parcel.weightKg),
        parcels: parcelsCount,
        cashToCollect: Math.max(0, toNumberSafe(payment.codAmountAr) || 0),
        notes: (payment.notes || '').trim() || undefined,
        recipientPhone: cleanedRecipientPhone || undefined,
        recipientEmail: recipient.email?.trim() || undefined,
        needReturn: !!service.needReturn,
        slotStart,
        slotEnd,
        // Optional fields for future server-side zone derivation
        ...(selectedDropoffLocality ? { dropoffLocalityId: selectedDropoffLocality.id } : {}),
        ...(pickupLatLng ? { pickupLat: pickupLatLng.lat, pickupLng: pickupLatLng.lng } : {}),
        ...(dropoffLatLng ? { dropoffLat: dropoffLatLng.lat, dropoffLng: dropoffLatLng.lng } : {}),
      };
      if (!dropoffLatLng) {
        orderPayload.zoneLevel = zoneLevel;
      }
      // Always include zoneLevel for backend pricing/slots, preferring server-inferred zone (from coords)
      orderPayload.zoneLevel = ((serverQuote?.inferredZone as any) || zoneLevel);

      const created = await api.orders.postApiOrders(orderPayload as any);
      resetForm();
      showToast("Commande créée", "success");
      // Navigate to tracking with created id for MVP
      router.replace({ pathname: "/tracking/[id]" as any, params: { id: String(created.id) } });
    } catch (e: any) {
      console.warn("create order error", e);
      showToast("Création échouée", "error");
      // toast only, avoid blocking modal
    } finally {
      setSubmitting(false);
    }
  };
  const resetForm = () => {
    setParcel(INITIAL_PARCEL);
    setSender(INITIAL_SENDER);
    setRecipient(INITIAL_RECIPIENT);
    setService(INITIAL_SERVICE);
    setPayment(INITIAL_PAYMENT);
    setStep(0);
  };
  return (
    <View className="flex-1 bg-gray-50">
      {/* Back Button */}
      <View className="absolute top-12 left-6 z-50">
        <TouchableOpacity onPress={goPrev} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step === 0 && (
          <SecondStep
            sender={sender}
            setSender={setSender}
            onPickupSelected={({ label, lat, lng }) => {
              setPickupLatLng({ lat, lng });
              showToast('Adresse de collecte sélectionnée', 'success');
            }}
            coordsText={pickupLatLng ? `Coordonnées pickup: ${pickupLatLng.lat.toFixed(5)}, ${pickupLatLng.lng.toFixed(5)}` : null}
          />
        )}

        {step === 1 && (
          <ThirdStep
            recipient={recipient}
            setRecipient={setRecipient}
            onDropoffSelected={({ label, lat, lng }) => {
              setDropoffLatLng({ lat, lng });
              showToast('Adresse sélectionnée', 'success');
            }}
            coordsText={dropoffLatLng ? `Coordonnées: ${dropoffLatLng.lat.toFixed(5)}, ${dropoffLatLng.lng.toFixed(5)}` : null}
          />
        )}

        {step === 2 && <FirstStep parcel={parcel} setParcel={setParcel} />}

        {step === 3 && <FourthStep service={service} setService={setService} lockDistance={true} />}

        {step === 4 && (
          <FifthStep 
            payment={payment} 
            setPayment={setPayment}
            sender={{ name: sender.name, phone: sender.phone, address: sender.address }}
            recipient={{ name: recipient.name, phone: recipient.phone, address: recipient.address }}
            parcel={{ 
              type: parcel.fragile ? "Fragile" : parcel.category === "ENVELOPE" ? "Document" : "Other",
              weight: `${parcel.weightKg}KG`,
              size: parcel.category === "SMALL" ? "Small" : parcel.category === "MEDIUM" ? "Medium" : "Large"
            }}
            service={{ service: service.service, distanceKmBracket: service.distanceKmBracket }}
            estimatedPrice={serverQuote?.total || 0}
          />
        )}
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View className="bg-white px-6 py-4 border-t border-gray-200">
        {/* Price display */}
        {serverQuote?.total != null && !serverQuote?.manual && (
          <View className="mb-3 items-center">
            <Text className="text-xs text-gray-500">Estimated price</Text>
            <Text className="text-xl font-quicksand-bold text-red-600">{formatAr(serverQuote.total)}</Text>
          </View>
        )}

        {/* Navigation Buttons */}
        <View className="gap-3">
            {step > 0 && (
              <TouchableOpacity
                onPress={goPrev}
              activeOpacity={0.8}
              className="w-full rounded-3xl border-2 border-[#FFD700] py-4 items-center justify-center"
              >
              <Text className="text-[#FFD700] font-quicksand-bold text-base">Previous step</Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.8}
            disabled={submitting}
            className={`w-full rounded-3xl py-4 items-center justify-center ${
              submitting ? "bg-gray-300" : "bg-[#FFD700]"
            }`}
          >
            <Text className="text-white font-quicksand-bold text-base">
              {step < steps.length - 1 ? "Next step" : submitting ? "Processing…" : "Payment"}
                </Text>
            </TouchableOpacity>
        </View>

        {/* Quote error/status */}
        {quoteError && (
          <Text className="text-xs text-red-600 text-center mt-2">{quoteError}</Text>
        )}
        {serverQuote?.manual && (
          <Text className="text-xs text-amber-700 text-center mt-2">
            {serverQuote.instructions || "Manual handling required. Contact support."}
          </Text>
        )}
      </View>

      {/* Review modal */}
      <OrderReviewModal
        visible={showReview}
        onClose={() => setShowReview(false)}
        onConfirm={() => {
          setShowReview(false);
          submit();
        }}
        sender={sender}
        recipient={recipient}
        parcel={parcel}
        service={service}
        payment={payment}
        pickupLocality={selectedPickupLocality}
        dropoffLocality={selectedDropoffLocality}
        zoneLevel={(serverQuote?.inferredZone as any) || toZoneLevel(service.distanceKmBracket)}
        priceTotal={serverQuote?.total ?? null}
      />
    </View>
  );
}
