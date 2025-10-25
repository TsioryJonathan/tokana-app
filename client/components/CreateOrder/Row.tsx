import React from 'react';
import {View, Text} from 'react-native';

// Small local component for label/value row
export const Row = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <View className="py-1.5 flex-row items-center justify-between">
      <Text className="text-slate-500">{label}</Text>
      <Text className="text-slate-800 font-quicksand-semibold">{String(value)}</Text>
    </View>
  );
}

export default Row;