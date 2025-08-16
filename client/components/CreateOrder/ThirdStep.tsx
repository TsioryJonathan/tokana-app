import { View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import LabeledInput from "../ui/LabeledInput";
import SectionHeader from "../ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { RecipientState } from "@/types/createorder.type";

const ThirdStep = ({
  recipient,
  setRecipient,
}: {
  recipient: RecipientState;
  setRecipient: Dispatch<SetStateAction<RecipientState>>;
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <SectionHeader
        icon={<Ionicons name="person-outline" size={16} color="#0F172A" />}
        title="Destinataire"
      />
      <LabeledInput
        label="Nom complet"
        placeholder="Ex: Rabe Hery"
        value={recipient.name}
        onChangeText={(t) => setRecipient({ ...recipient, name: t })}
      />
      <LabeledInput
        label="Téléphone"
        placeholder="033..."
        keyboardType="phone-pad"
        value={recipient.phone}
        onChangeText={(t) => setRecipient({ ...recipient, phone: t })}
      />
      <LabeledInput
        label="Adresse de livraison"
        placeholder="Quartier, rue, repère"
        value={recipient.address}
        onChangeText={(t) => setRecipient({ ...recipient, address: t })}
      />
    </View>
  );
};

export default ThirdStep;
