import { View, Text } from "react-native";
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
        title="Paiement (en implémentation) & notes"
      />
      <View className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <Text className="text-[12px] text-amber-800 font-quicksand-medium">
          Les fonctionnalités de paiement ne sont pas encore disponibles dans cet MVP.
          Vous pouvez ajouter des notes pour le livreur si nécessaire.
        </Text>
      </View>
      <LabeledInput
        label="Montant à encaisser (Ar)"
        placeholder="Ex: 12000"
        keyboardType="numeric"
        value={payment.codAmountAr}
        onChangeText={(t) => setPayment({ ...payment, codAmountAr: t })}
      />
      <View className="h-2" />
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
