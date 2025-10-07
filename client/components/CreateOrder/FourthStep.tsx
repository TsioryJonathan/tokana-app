import { View, Text } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import ToggleRow from "../ui/ToggleRow";
import { Ionicons } from "@expo/vector-icons";
import Chip from "../ui/Chip";
import SectionHeader from "../ui/SectionHeader";
import { ServiceState } from "@/types/createorder.type";

const FourthStep = ({
  service,
  setService,
  lockDistance,
}: {
  service: ServiceState;
  setService: Dispatch<SetStateAction<ServiceState>>;
  lockDistance?: boolean;
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <SectionHeader
        icon={<Ionicons name="bicycle-outline" size={16} color="#0F172A" />}
        title="Service & distance"
      />
      <Text className="mb-1 text-[12px] text-slate-600">Type de service</Text>
      <View className="flex-row mb-2">
        <Chip
          label="Standard"
          active={service.service === "STANDARD"}
          onPress={() => setService({ ...service, service: "STANDARD" })}
        />
        <Chip
          label="Express"
          active={service.service === "EXPRESS"}
          onPress={() => setService({ ...service, service: "EXPRESS" })}
        />
      </View>

      <Text className="mb-1 text-[12px] text-slate-600">Distance estimée {lockDistance ? '(verrouillée par localité)' : ''}</Text>
      <View className={`flex-row ${lockDistance ? 'opacity-60' : ''}`}>
        <Chip
          label="< 5 km"
          active={service.distanceKmBracket === "<5"}
          onPress={() => { if (!lockDistance) setService({ ...service, distanceKmBracket: "<5" }); }}
        />
        <Chip
          label="5 – 10 km"
          active={service.distanceKmBracket === "5-10"}
          onPress={() => { if (!lockDistance) setService({ ...service, distanceKmBracket: "5-10" }); }}
        />
        <Chip
          label="10 – 20 km"
          active={service.distanceKmBracket === "10-20"}
          onPress={() => { if (!lockDistance) setService({ ...service, distanceKmBracket: "10-20" }); }}
        />
      </View>
      {lockDistance ? (
        <Text className="mt-1 text-[11px] text-slate-500">Zone fixée automatiquement par la localité de livraison.</Text>
      ) : null}

      <View className="h-2" />
      <ToggleRow
        icon={<Ionicons name="refresh-outline" size={18} color="#0F172A" />}
        label="Retour nécessaire"
        value={service.needReturn}
        onChange={(v) => setService({ ...service, needReturn: v })}
      />
    </View>
  );
};

export default FourthStep;
