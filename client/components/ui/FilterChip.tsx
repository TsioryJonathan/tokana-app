import React from "react";
import { TouchableOpacity, Text } from "react-native";

export default function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`mr-2 px-3 py-1.5 rounded-full border ${
        active ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-200"
      }`}
    >
      <Text
        className={`text-[12px] font-quicksand-semibold ${
          active ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
