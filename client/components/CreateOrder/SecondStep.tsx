import { View, Text } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import SectionHeader from "../ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import LabeledInput from "../ui/LabeledInput";
import { SenderState } from "@/types/createorder.type";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const SecondStep = ({
  sender,
  setSender,
  onPickupSelected,
  bbox = [47.4, -19.1, 47.7, -18.7] as [number, number, number, number],
  coordsText,
}: {
  sender: SenderState;
  setSender: Dispatch<SetStateAction<SenderState>>;
  onPickupSelected?: (sel: { label: string; lat: number; lng: number }) => void;
  bbox?: [number, number, number, number];
  coordsText?: string | null;
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
      <View className="h-2" />
      <AddressAutocomplete
        label="Adresse de collecte (autocomplétion)"
        placeholder="Saisir l'adresse de collecte (Antananarivo)"
        bbox={bbox}
        onSelected={({ label, lat, lng }) => {
          onPickupSelected?.({ label, lat, lng });
        }}
        onTextChange={(t) => setSender({ ...sender, address: t })}
        initialText={sender.address}
      />
      <Text className="mt-1 text-[11px] text-slate-500">
        La sélection d’une suggestion Mapbox nous aide à mieux situer la zone, mais votre adresse saisie reste telle quelle.
      </Text>
      {!!coordsText && (
        <Text className="mt-2 text-[11px] text-slate-500">{coordsText}</Text>
      )}
    </View>
  );
};

export default SecondStep;
