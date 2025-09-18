import { View, Text, Platform } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import SectionHeader from "../ui/SectionHeader";
import Chip from "../ui/Chip";
import LabeledInput from "../ui/LabeledInput";
import ToggleRow from "../ui/ToggleRow";
import { ParcelState } from "@/types/createorder.type";
import { BoxIcon } from "lucide-react-native";

const FirstStep = ({
  parcel,
  setParcel,
}: {
  parcel: ParcelState;
  setParcel: Dispatch<SetStateAction<ParcelState>>;
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <SectionHeader
        icon={<BoxIcon size={24} color="#0F172A" />}
        title="Colis"
      />
      <Text className="mb-3 text-[16px] text-slate-600 font-semibold">
        Catégorie
      </Text>
      <View className="flex-row flex-wrap mb-2">
        {[
          ["ENVELOPE", "Enveloppe"],
          ["SMALL", "Petit"],
          ["MEDIUM", "Moyen"],
          ["LARGE", "Volumineux"],
        ].map(([val, label]) => (
          <Chip
            key={val}
            label={label}
            active={parcel.category === (val as any)}
            onPress={() => setParcel({ ...parcel, category: val as any })}
          />
        ))}
      </View>

      <LabeledInput
        label="Poids (kg)"
        placeholder="Ex: 2"
        keyboardType={Platform.select({
          ios: "decimal-pad",
          android: "numeric",
        })}
        value={parcel.weightKg}
        onChangeText={(t) => setParcel({ ...parcel, weightKg: t })}
        right={<Text className="ml-2 text-[12px] text-slate-500">kg</Text>}
      />

      <View className="h-2" />
      <LabeledInput
        label="Nombre de colis"
        placeholder="Ex: 1"
        keyboardType={Platform.select({
          ios: "number-pad",
          android: "numeric",
        })}
        value={parcel.parcelsCount || "1"}
        onChangeText={(t) => setParcel({ ...parcel, parcelsCount: t })}
      />

      <View className="h-2" />
      <ToggleRow
        icon={
          <MaterialCommunityIcons
            name="glass-fragile"
            size={18}
            color="#0F172A"
          />
        }
        label="Fragile"
        value={parcel.fragile}
        onChange={(v) => setParcel({ ...parcel, fragile: v })}
      />
      <View className="h-2" />
      <ToggleRow
        icon={<Ionicons name="cube" size={18} color="#0F172A" />}
        label="Volumineux"
        value={parcel.bulky}
        onChange={(v) => setParcel({ ...parcel, bulky: v })}
      />
    </View>
  );
};

export default FirstStep;
