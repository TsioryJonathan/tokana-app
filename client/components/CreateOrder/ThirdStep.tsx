import { View, Text, TextInput, Image } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { User, Phone, MapPin, ChevronRight } from "lucide-react-native";
import { RecipientState } from "@/types/createorder.type";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { assets } from "@/assets/images/assets";

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
    <View className="flex-1">
      {/* Illustration Header */}
      <View className="relative bg-[#FFF9E6] pt-8 pb-6 items-center">
        <Image
          source={assets.registerStepTwo}
          style={{ width: "90%", height: 180, opacity: 0.4 }}
          resizeMode="contain"
        />
        
        {/* Step Indicator and Title */}
        <View className="mt-4 px-6 w-full">
          <Text className="text-5xl font-clash text-gray-900 font-bold">
            02<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2">
            Recipient information
          </Text>
        </View>
      </View>

      {/* Form Section */}
      <View className="flex-1 bg-white px-6 pt-6">
        {/* Name Input */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <User size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <TextInput
              value={recipient.name}
              onChangeText={(t) => setRecipient({ ...recipient, name: t })}
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
            />
          </View>
        </View>

        {/* Phone Input with Country Code */}
        <View className="flex-row gap-3 mb-4">
          <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 px-4 py-4 flex-row items-center justify-center border border-gray-100">
            <Text className="text-lg mr-1">🇲🇬</Text>
            <Text className="font-quicksand-bold text-gray-700 text-sm">+261</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl shadow-md shadow-gray-300/50 border border-gray-100">
            <View className="flex-row items-center px-5 py-4">
              <View className="bg-[#FFD700]/10 p-2 rounded-full">
                <Phone size={20} color="#FFD700" strokeWidth={2.5} />
              </View>
              <TextInput
                value={recipient.phone}
                onChangeText={(t) => setRecipient({ ...recipient, phone: t })}
                placeholder="Phone"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
              />
            </View>
          </View>
        </View>

        {/* Address Input */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <MapPin size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <AddressAutocomplete
                placeholder="Address"
                bbox={bbox}
                onSelected={({ label, lat, lng }) => {
                  onDropoffSelected?.({ label, lat, lng });
                }}
                onTextChange={(t) => setRecipient({ ...recipient, address: t })}
                initialText={recipient.address}
                containerClassName="ml-3"
                inputClassName="font-quicksand text-gray-900 text-base"
              />
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </View>

        {coordsText && (
          <Text className="text-xs text-gray-400 px-2">
            {coordsText}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ThirdStep;
