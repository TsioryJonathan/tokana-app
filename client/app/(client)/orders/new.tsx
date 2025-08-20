import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import {
  basePrice,
  computeSurcharges,
  formatAr,
  toNumberSafe,
} from "@/utils/price.helper";

/* INITIAL STATES */
const INITIAL_PARCEL: ParcelState = {
  category: "SMALL",
  weightKg: "",
  fragile: false,
  bulky: false,
};
const INITIAL_SENDER: SenderState = { name: "", phone: "", address: "" };
const INITIAL_RECIPIENT: RecipientState = { name: "", phone: "", address: "" };
const INITIAL_SERVICE: ServiceState = {
  service: "STANDARD",
  distanceKmBracket: "<5",
  needReturn: false,
};
const INITIAL_PAYMENT: PaymentState = { codAmountAr: "", notes: "" };

const mgPhoneRegex = /^(\+261|0)\d{8,9}$/;

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
  const [step, setStep] = useState<Step>(0);
  const [parcel, setParcel] = useState<ParcelState>(INITIAL_PARCEL);
  const [sender, setSender] = useState<SenderState>(INITIAL_SENDER);
  const [recipient, setRecipient] = useState<RecipientState>(INITIAL_RECIPIENT);
  const [service, setService] = useState<ServiceState>(INITIAL_SERVICE);
  const [payment, setPayment] = useState<PaymentState>(INITIAL_PAYMENT);
  const price = useMemo(
    () =>
      basePrice(service.distanceKmBracket, service.service) +
      computeSurcharges(parcel, service),
    [parcel, service]
  );
  const validateCurrent = (): string[] => {
    const errs: string[] = [];
    if (step === 0) {
      if (toNumberSafe(parcel.weightKg) <= 0)
        errs.push("Poids du colis invalide");
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
    if (step === 4) {
      if (payment.codAmountAr && toNumberSafe(payment.codAmountAr) <= 0)
        errs.push("Montant à récupérer invalide");
    }
    return errs;
  };

  const goNext = () => {
    const errs = validateCurrent();
    if (errs.length) return Alert.alert("Vérifie cette étape", errs.join("\n"));
    if (step < steps.length - 1) setStep((s) => (s + 1) as Step);
    else submit();
  };
  const goPrev = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
    else router.back();
  };
  const submit = () => {
    const payload = {
      sender,
      recipient,
      parcel: { ...parcel, weightKg: toNumberSafe(parcel.weightKg) },
      service,
      options: {
        codAmountAr: toNumberSafe(payment.codAmountAr),
        notes: payment.notes?.trim() || undefined,
      },
      priceAr: price,
    };
    // TODO: await api.createOrder(payload)

    resetForm();
    router.replace("/orders" as any);
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

        {step === 2 && (
          <ThirdStep recipient={recipient} setRecipient={setRecipient} />
        )}

        {step === 3 && <FourthStep service={service} setService={setService} />}

        {step === 4 && <FifthStep payment={payment} setPayment={setPayment} />}

        {/* Footer: prix + actions */}
        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] text-slate-500">Estimation</Text>
            <Text className="text-xl font-quicksand-bold text-slate-900">
              {formatAr(price)}
            </Text>
          </View>

          <View className="flex-row">
            {step > 0 && (
              <TouchableOpacity
                onPress={goPrev}
                activeOpacity={0.9}
                className="mr-2 px-4 py-3 rounded-xl bg-slate-200"
              >
                <Text className="font-quicksand-bold text-slate-800">
                  Précédent
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.9}
              className="px-5 py-3 rounded-xl bg-emerald-600"
            >
              <View className="flex-row items-center">
                <Text className="text-white font-quicksand-bold">
                  {step < steps.length - 1 ? "Suivant" : "Confirmer"}
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
