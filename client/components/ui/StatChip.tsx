import React from "react";
import { View, Text } from "react-native";

export default function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl px-4 py-3 mr-3 shadow-sm border border-slate-100">
      <View className="flex-row items-center">
        <View>{icon}</View>
        <Text className="ml-2 text-[12px] text-slate-500 font-quicksand-medium">
          {label}
        </Text>
      </View>
      <Text className="mt-1 text-xl font-quicksand-bold text-slate-900">
        {value}
      </Text>
    </View>
  );
}
