import { View, Text, Platform, TextInput, TouchableOpacity, Image } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { Package, Scale, Maximize } from "lucide-react-native";
import { ParcelState } from "@/types/createorder.type";
import { assets } from "@/assets/images/assets";

const FirstStep = ({
  parcel,
  setParcel,
}: {
  parcel: ParcelState;
  setParcel: Dispatch<SetStateAction<ParcelState>>;
}) => {
  const parcelTypes = [
    { value: 'fragile', label: 'Fragile', icon: '📦' },
    { value: 'document', label: 'Document', icon: '📄' },
    { value: 'other', label: 'Other', icon: '⬛' },
  ];

  return (
    <View className="flex-1">
      {/* Illustration Header */}
      <View className="relative bg-[#FFF9E6] pt-8 pb-6 items-center">
        <Image
          source={assets.registerStepThird}
          style={{ width: "90%", height: 180, opacity: 0.4 }}
          resizeMode="contain"
        />
        
        {/* Step Indicator and Title */}
        <View className="mt-4 px-6 w-full">
          <Text className="text-5xl font-clash text-gray-900 font-bold">
            03<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2">
            Parcel information
          </Text>
        </View>
      </View>

      {/* Form Section */}
      <View className="flex-1 bg-white px-6 pt-6">
        {/* Type Section */}
        <Text className="text-lg font-quicksand-bold text-gray-800 mb-3">
          Type
        </Text>
        
        <View className="flex-row gap-3 mb-6">
          {parcelTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setParcel({ ...parcel, fragile: type.value === 'fragile' })}
              className={`flex-1 bg-white rounded-2xl shadow-md shadow-gray-300/50 border-2 ${
                (type.value === 'fragile' && parcel.fragile) || 
                (type.value === 'document' && !parcel.fragile && parcel.category === 'ENVELOPE') ||
                (type.value === 'other' && !parcel.fragile && parcel.category !== 'ENVELOPE')
                  ? 'border-[#FFD700]' 
                  : 'border-gray-100'
              }`}
            >
              <View className="items-center py-4">
                <Text className="text-3xl mb-2">{type.icon}</Text>
                <Text className="font-quicksand-semibold text-gray-700 text-sm">
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weight Input */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <Scale size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <TextInput
              value={parcel.weightKg}
              onChangeText={(t) => setParcel({ ...parcel, weightKg: t })}
              placeholder="Weight (kg)"
              placeholderTextColor="#9CA3AF"
              keyboardType={Platform.select({
                ios: "decimal-pad",
                android: "numeric",
              })}
              className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
            />
          </View>
        </View>

        {/* Size/Category Input */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <Maximize size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-quicksand text-gray-500 text-sm mb-1">Size</Text>
              <View className="flex-row gap-2">
                {[
                  ["SMALL", "Small"],
                  ["MEDIUM", "Medium"],
                  ["LARGE", "Large"],
                ].map(([val, label]) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setParcel({ ...parcel, category: val as any })}
                    className={`px-3 py-1 rounded-full border ${
                      parcel.category === val
                        ? 'bg-[#FFD700]/20 border-[#FFD700]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text className={`text-xs font-quicksand-semibold ${
                      parcel.category === val ? 'text-[#FFD700]' : 'text-gray-600'
                    }`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {Number(parcel.weightKg) > 5 && (
          <View className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Text className="text-xs text-amber-800 font-quicksand">
              ⚠️ Poids supérieur à 5 kg: un traitement manuel peut être nécessaire.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FirstStep;
