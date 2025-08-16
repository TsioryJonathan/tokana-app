import { View, Text, Platform } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import SectionHeader from "../ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import LabeledInput from "../ui/LabeledInput";
import { PaymentState } from "@/types/createorder.type";

const FifthStep = ({
  payment,
  setPayment,
}: {
  payment: PaymentState;
  setPayment: Dispatch<SetStateAction<PaymentState>>;
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <SectionHeader
        icon={<Ionicons name="card-outline" size={16} color="#0F172A" />}
        title="Paiement & notes"
      />
      <LabeledInput
        label="Montant à récupérer (optionnel)"
        placeholder="Ex: 80 000"
        keyboardType={Platform.select({
          ios: "number-pad",
          android: "numeric",
        })}
        value={payment.codAmountAr}
        onChangeText={(t) => setPayment({ ...payment, codAmountAr: t })}
        right={<Text className="ml-2 text-[12px] text-slate-500">Ar</Text>}
      />
      <LabeledInput
        label="Instructions / notes"
        placeholder="Code portail, repère..."
        value={payment.notes}
        onChangeText={(t) => setPayment({ ...payment, notes: t })}
        multiline
      />
    </View>
  );
};

export default FifthStep;
