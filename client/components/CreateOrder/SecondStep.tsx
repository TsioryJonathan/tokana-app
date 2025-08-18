import { View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import SectionHeader from "../ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import LabeledInput from "../ui/LabeledInput";
import { SenderState } from "@/types/createorder.type";

const SecondStep = ({
  sender,
  setSender,
}: {
  sender: SenderState;
  setSender: Dispatch<SetStateAction<SenderState>>;
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <SectionHeader
        icon={<Ionicons name="person-outline" size={16} color="#0F172A" />}
        title="Expéditeur"
      />
      <LabeledInput
        label="Nom complet"
        placeholder="Ex: Rakoto Andry"
        value={sender.name}
        onChangeText={(t) => setSender({ ...sender, name: t })}
      />
      <LabeledInput
        label="Téléphone"
        placeholder="034..."
        keyboardType="phone-pad"
        value={sender.phone}
        onChangeText={(t) => setSender({ ...sender, phone: t })}
      />
      <LabeledInput
        label="Adresse de collecte"
        placeholder="Quartier, rue, repère"
        value={sender.address}
        onChangeText={(t) => setSender({ ...sender, address: t })}
      />
    </View>
  );
};

export default SecondStep;
