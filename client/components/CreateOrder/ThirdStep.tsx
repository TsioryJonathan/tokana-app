import { View, Text } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import LabeledInput from "../ui/LabeledInput";
import SectionHeader from "../ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { RecipientState } from "@/types/createorder.type";
import AddressAutocomplete from "@/components/AddressAutocomplete";

const ThirdStep = ({
  recipient,
  setRecipient,
  onDropoffSelected,
  bbox = [47.4, -19.1, 47.7, -18.7] as [number, number, number, number],
  coordsText,
}: {
  recipient: RecipientState;
  setRecipient: Dispatch<SetStateAction<RecipientState>>;
  onDropoffSelected?: (sel: { label: string; lat: number; lng: number }) => void;
  bbox?: [number, number, number, number];
  coordsText?: string | null;
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
        label="Email (optionnel)"
        placeholder="ex: client@mail.com"
        keyboardType="email-address"
        value={recipient.email || ""}
        onChangeText={(t) => setRecipient({ ...recipient, email: t })}
      />
      <View className="h-2" />
      <AddressAutocomplete
        label="Adresse de livraison (autocomplétion)"
        placeholder="Saisir l'adresse (Antananarivo)"
        bbox={bbox}
        onSelected={({ label, lat, lng }) => {
          onDropoffSelected?.({ label, lat, lng });
        }}
        onTextChange={(t) => setRecipient({ ...recipient, address: t })}
        initialText={recipient.address}
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

export default ThirdStep;
