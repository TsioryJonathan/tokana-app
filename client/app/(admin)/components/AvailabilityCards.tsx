import React from 'react';
import { View, Text } from 'react-native';

export function AvailabilityCards({ isStandard, isExpress }: { isStandard: boolean; isExpress: boolean }) {
  return (
    <View className="flex-row gap-3 mb-4 flex-wrap">
      <View className={`px-4 py-3 rounded-md border ${isStandard ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
        <Text className="font-quicksand-bold">Standard</Text>
        <Text className="text-slate-700">{isStandard ? 'OUVERT (04:00–23:00)' : 'FERMÉ (04:00–23:00)'}</Text>
      </View>
      <View className={`px-4 py-3 rounded-md border ${isExpress ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
        <Text className="font-quicksand-bold">Express</Text>
        <Text className="text-slate-700">{isExpress ? 'OUVERT (06:00–15:00)' : 'FERMÉ (06:00–15:00)'}</Text>
      </View>
    </View>
  );
}
