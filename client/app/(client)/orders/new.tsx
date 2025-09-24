import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
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
  "Colis",
  "Expéditeur",
  "Destinataire",
  "Service",
  "Paiement",
] as const;
type Step = 0 | 1 | 2 | 3 | 4;

function Stepper({ step }: { step: Step }) {
  return (
    <View className="flex-row items-center justify-center px-5 py-3 bg-white border-b border-slate-200">
      {steps.map((label, i) => {
        const active = i <= step;
        return (
          <View key={label} className="flex-row items-center">
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                active ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <Text
                className={`text-[12px] ${active ? "text-white" : "text-slate-600"} font-quicksand-bold`}
              >
                {i + 1}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                className={`w-8 h-[2px] mx-1 ${i < step ? "bg-emerald-600" : "bg-slate-200"}`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

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
  } | null>(null);
  const [expressEta, setExpressEta] = useState<{ min: number; max: number } | null>(null);
  // Local estimation removed to avoid confusion; we rely solely on server quote
  // API client
  const api = useMemo(getApiClient, []);

  // Locality selection
  const [selectedPickupLocality, setSelectedPickupLocality] = useState<LocalityItem | null>(null);
  const [selectedDropoffLocality, setSelectedDropoffLocality] = useState<LocalityItem | null>(null);
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
    const zoneLevel = toZoneLevel(service.distanceKmBracket);
    const type = service.service === "EXPRESS" ? "express" : "standard";
    const parcelsCount = Math.max(1, toNumberSafe(parcel.parcelsCount || "1"));
    const weight = toNumberSafe(parcel.weightKg);
    if (!weight || weight <= 0) {
      setServerQuote(null);
      setQuoteError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const zoneEnum =
          zoneLevel === "ville"
            ? PricingQuoteRequest.zoneLevel.VILLE
            : zoneLevel === "peripherie"
            ? PricingQuoteRequest.zoneLevel.PERIPHERIE
            : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
        const typeEnum =
          type === "express"
            ? PricingQuoteRequest.type.EXPRESS
            : PricingQuoteRequest.type.STANDARD;
        const quote = await api.pricing.postApiPricingQuote({
          zoneLevel: zoneEnum,
          type: typeEnum,
          weight,
          parcels: parcelsCount,
        });
        if (cancelled) return;
        setServerQuote({
          total: quote?.priceTotal ?? undefined,
          pickup: quote?.fees?.pickupFee ?? undefined,
          delivery: quote?.fees?.deliveryFee ?? undefined,
          express: quote?.fees?.expressSurcharge ?? undefined,
          manual: !!quote?.requiresManualHandling,
          instructions: quote?.instructions ?? null,
          contactPhone: (quote as any)?.contactPhone ?? null,
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
  }, [api, service.distanceKmBracket, service.service, parcel.weightKg, parcel.parcelsCount]);
  const validateCurrent = (): string[] => {
    const errs: string[] = [];
    if (step === 0) {
      if (toNumberSafe(parcel.weightKg) <= 0)
        errs.push("Poids du colis invalide");
      const n = toNumberSafe(parcel.parcelsCount || "1");
      if (!Number.isFinite(n) || n < 1 || Math.floor(n) !== n)
        errs.push("Nombre de colis doit être un entier ≥ 1");
    }
    if (step === 1) {
      if (!sender.name.trim()) errs.push("Nom expéditeur requis");
      if (!mgPhoneRegex.test(sender.phone.trim()))
        errs.push("Téléphone expéditeur invalide");
      if (!sender.address.trim()) errs.push("Adresse expéditeur requise");
    }
    if (step === 2) {
      if (!recipient.name.trim()) errs.push("Nom destinataire requis");
      if (!mgPhoneRegex.test(recipient.phone.trim()))
        errs.push("Téléphone destinataire invalide");
      if (!recipient.address.trim()) errs.push("Adresse destinataire requise");
    }
    if (step === 3) {
      // Service: exiger la localité de livraison pour éviter toute ambiguïté de zone
      if (!selectedDropoffLocality) errs.push("Sélectionnez la localité de livraison");
    }
    // Étape paiement: non bloquante (en implémentation)
    return errs;
  };

  const goNext = () => {
    const errs = validateCurrent();
    if (errs.length) {
      showToast(errs.join("\n"), "error");
      return;
    }
    if (step < steps.length - 1) setStep((s) => (s + 1) as Step);
    else submit();
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
    // Require a valid server quote before proceeding to avoid confusion
    if (quoteLoading) {
      showToast("Calcul du devis en cours…", "info");
      return;
    }
    if (!serverQuote || serverQuote.total == null) {
      showToast("Devis indisponible. Vérifie le poids, la zone et réessaie.", "error");
      return;
    }
    if (serverQuote.manual) {
      showToast(serverQuote.instructions || "Traitement manuel requis. Contactez le support.", "info");
      return;
    }
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
          const slots = await api.slots.getApiSlotsStandard(zoneLevel);
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
        const zoneEnum =
          zoneLevel === "ville"
            ? PricingQuoteRequest.zoneLevel.VILLE
            : zoneLevel === "peripherie"
            ? PricingQuoteRequest.zoneLevel.PERIPHERIE
            : PricingQuoteRequest.zoneLevel.SUPER_PERIPHERIE;
        const typeEnum =
          type === "express"
            ? PricingQuoteRequest.type.EXPRESS
            : PricingQuoteRequest.type.STANDARD;
        const quote = await api.pricing.postApiPricingQuote({
          zoneLevel: zoneEnum,
          type: typeEnum,
          weight: toNumberSafe(parcel.weightKg),
          parcels: parcelsCount,
        });
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

      const created = await api.orders.postApiOrders({
        type,
        zoneLevel,
        pickupAddress: sender.address.trim(),
        pickupName: sender.name.trim() || undefined,
        pickupPhone: sender.phone.trim() || undefined,
        dropoffAddress: recipient.address.trim(),
        dropoffName: recipient.name.trim() || undefined,
        weight: toNumberSafe(parcel.weightKg),
        parcels: parcelsCount,
        cashToCollect: Math.max(0, toNumberSafe(payment.codAmountAr) || 0),
        notes: (payment.notes || '').trim() || undefined,
        recipientPhone: recipient.phone?.trim() || undefined,
        recipientEmail: recipient.email?.trim() || undefined,
        slotStart,
        slotEnd,
        // Optional fields for future server-side zone derivation
        ...(selectedPickupLocality ? { pickupLocalityId: selectedPickupLocality.id } : {}),
        ...(selectedDropoffLocality ? { dropoffLocalityId: selectedDropoffLocality.id } : {}),
      } as any);
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
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity onPress={goPrev} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-quicksand-bold text-slate-900 flex-1">
          Nouvelle commande
        </Text>
        <Text className="text-[12px] text-slate-500">
          {step + 1}/{steps.length}
        </Text>
      </View>

      <Stepper step={step} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        {step === 0 && <FirstStep parcel={parcel} setParcel={setParcel} />}

        {step === 1 && <SecondStep sender={sender} setSender={setSender} />}
        {step === 1 && (
          <LocalitySelector
            selected={selectedPickupLocality}
            onSelect={(loc) => setSelectedPickupLocality(loc)}
            onReset={() => setSelectedPickupLocality(null)}
            label="Localité de collecte (optionnel)"
          />
        )}

        {step === 2 && (
          <ThirdStep recipient={recipient} setRecipient={setRecipient} />
        )}

        {step === 3 && <FourthStep service={service} setService={setService} lockDistance={!!selectedDropoffLocality} />}
        {step === 3 && (
          <LocalitySelector
            selected={selectedDropoffLocality}
            onSelect={(loc) => setSelectedDropoffLocality(loc)}
            onReset={() => setSelectedDropoffLocality(null)}
            label="Localité de livraison"
          />
        )}
        {/* Service hints based on selection */}
        {step === 3 && (
          <View className="mt-2 flex-row items-center">
            {service.service === "EXPRESS" ? (
              <View className="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <Text className="text-[11px] text-emerald-700">⚡ Express: 06:00–15:00 (jour même, selon dispo)</Text>
              </View>
            ) : (
              <View className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                <Text className="text-[11px] text-slate-700">
                  {(() => {
                    const z = toZoneLevel(service.distanceKmBracket);
                    if (z === "ville") return "Standard (demain): 10:00–17:00";
                    if (z === "peripherie") return "Standard (demain): 12:00–17:00";
                    return "Standard (demain): 14:00–17:00";
                  })()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ETA Express (affiché si service Express et dispo) */}
        {service.service === "EXPRESS" && expressEta && (
          <View className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <Text className="text-[12px] text-emerald-700">
              Livraison estimée {expressEta.min}–{expressEta.max} minutes
            </Text>
          </View>
        )}

        {step === 4 && <FifthStep payment={payment} setPayment={setPayment} />}

        {/* Footer: devis serveur + actions (responsive vertical) */}
        <View className="mt-4">
          {/* Devis serveur */}
          <View>
            <Text className="text-[12px] text-slate-500">Devis</Text>
            {quoteLoading ? (
              <View>
                <View className="mt-1 h-5 w-40 bg-slate-200 rounded" />
                <View className="mt-1 h-3 w-64 bg-slate-100 rounded" />
              </View>
            ) : serverQuote?.manual ? (
              <Text className="text-[12px] text-amber-700">
                {serverQuote.instructions || "Traitement manuel requis. Contactez le support."}
              </Text>
            ) : serverQuote?.total != null ? (
              <Text className="text-xl font-quicksand-bold text-emerald-700">{formatAr(serverQuote.total)}</Text>
            ) : quoteError ? (
              <Text className="text-[12px] text-rose-700">{quoteError}</Text>
            ) : (
              <Text className="text-[12px] text-slate-500">Indique le poids et la localité/zone pour obtenir le devis</Text>
            )}
            {serverQuote && !serverQuote.manual && (
              <Text className="mt-0.5 text-[11px] text-slate-500">
                {`Pickup: ${serverQuote.pickup ? formatAr(serverQuote.pickup) : '—'} · Livraison: ${serverQuote.delivery ? formatAr(serverQuote.delivery) : '—'} · Express: ${serverQuote.express ? formatAr(serverQuote.express) : '—'}`}
              </Text>
            )}
          </View>

          {/* Manual handling prominent banner */}
          {serverQuote?.manual && (
            <View className="mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50">
              <Text className="text-[12px] text-amber-800 font-quicksand-semibold">Traitement manuel requis</Text>
              {serverQuote.instructions ? (
                <Text className="mt-1 text-[12px] text-amber-800">{serverQuote.instructions}</Text>
              ) : null}
              {serverQuote.contactPhone ? (
                <Text className="mt-1 text-[12px] text-amber-800">Contact: {serverQuote.contactPhone}</Text>
              ) : null}
            </View>
          )}

          {/* Actions */}
          <View className="mt-3">
            {step > 0 && (
              <TouchableOpacity
                onPress={goPrev}
                activeOpacity={0.9}
                className="w-full px-4 py-3 rounded-xl bg-slate-200 mb-2"
              >
                <Text className="text-center font-quicksand-bold text-slate-800">
                  Précédent
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.9}
              disabled={submitting || quoteLoading || !serverQuote || serverQuote?.manual}
              className={`w-full px-5 py-3 rounded-xl ${submitting || quoteLoading || !serverQuote || serverQuote?.manual ? "bg-emerald-300" : "bg-emerald-600"}`}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white font-quicksand-bold mr-1">
                  {step < steps.length - 1 ? "Suivant" : submitting ? "Envoi…" : "Confirmer"}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
