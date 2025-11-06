import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground } from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import { User, Phone, MapPin, ChevronRight, Globe } from "lucide-react-native";
import { SenderState } from "@/types/createorder.type";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { assets } from "@/assets/images/assets";

const SecondStep = ({
  sender,
  setSender,
  onPickupSelected,
  savedAddresses = [],
  bbox = [47.4, -19.1, 47.7, -18.7] as [number, number, number, number],
  coordsText,
}: {
  sender: SenderState;
  setSender: Dispatch<SetStateAction<SenderState>>;
  onPickupSelected?: (sel: { label: string; lat: number; lng: number }) => void;
  savedAddresses?: { id: string; label: string; detail: string; mapboxAddress?: string | null; lat?: number | null; lng?: number | null }[];
  bbox?: [number, number, number, number];
  coordsText?: string | null;
}) => {
  const [showSaved, setShowSaved] = useState(false);
  const [mapboxInputValue, setMapboxInputValue] = useState(sender.address || '');
  
  return (
    <View className="flex-1">
      {/* Illustration Header */}
      <View className="relative bg-[#FFF9E6] pt-8 pb-6 items-center">
        <Image
          source={assets.deliveryGuyMockup}
          style={{ width: "90%", height: 180, opacity: 0.3 }}
          resizeMode="contain"
        />
        
        {/* Step Indicator and Title */}
        <View className="mt-4 px-6 w-full">
          <Text className="text-5xl font-clash text-gray-900 font-bold">
            01<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2">
            Informations expéditeur
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
              value={sender.name}
              onChangeText={(t) => setSender({ ...sender, name: t })}
              placeholder="Nom"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
            />
          </View>
        </View>

        {/* Phone Input with Country Code */}
        <View className="flex-row gap-3 mb-4">
          <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 px-4 py-4 flex-row items-center justify-center border border-gray-100">
            <Globe size={18} color="#64748B" strokeWidth={2} />
            <Text className="font-quicksand-bold text-gray-700 text-sm ml-2">+261</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl shadow-md shadow-gray-300/50 border border-gray-100">
            <View className="flex-row items-center px-5 py-4">
              <View className="bg-[#FFD700]/10 p-2 rounded-full">
                <Phone size={20} color="#FFD700" strokeWidth={2.5} />
              </View>
              <TextInput
                value={sender.phone}
                onChangeText={(t) => setSender({ ...sender, phone: t })}
                placeholder="Téléphone"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
              />
            </View>
          </View>
        </View>

        {/* Adresses enregistrées (optionnel) */}
        {savedAddresses.length > 0 && (
          <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
            <TouchableOpacity
              className="flex-row items-center justify-between px-5 py-4"
              onPress={() => setShowSaved((s) => !s)}
              activeOpacity={0.8}
            >
              <Text className="font-quicksand-semibold text-gray-800">Adresses enregistrées</Text>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {showSaved && (
              <View className="border-t border-gray-100">
                {savedAddresses.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    className="px-5 py-3 border-b border-gray-50"
                    activeOpacity={0.8}
                    onPress={() => {
                      const mapboxAddr = a.mapboxAddress || '';
                      const exactAddr = a.detail || '';
                      setMapboxInputValue(mapboxAddr);
                      setSender({ 
                        ...sender, 
                        address: mapboxAddr, 
                        adresseExacte: exactAddr,
                        savedAddressId: a.id 
                      });
                      if (a.lat != null && a.lng != null) {
                        onPickupSelected?.({ label: mapboxAddr, lat: a.lat, lng: a.lng });
                      }
                      setShowSaved(false);
                    }}
                  >
                    <Text className="text-sm font-quicksand-semibold text-gray-800">{a.label || 'Adresse'}</Text>
                    <Text className="text-xs text-gray-500">{a.mapboxAddress || a.detail}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Adresse exacte (complément) */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <MapPin size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <TextInput
              value={sender.adresseExacte || ''}
              onChangeText={(t) => setSender({ ...sender, adresseExacte: t })}
              placeholder="Adresse exacte (bâtiment, étage, porte…)"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
            />
          </View>
        </View>

        {/* Address Input (autocomplétion) */}
        <View className="bg-white rounded-2xl shadow-md shadow-gray-300/50 mb-4 border border-gray-100">
          <View className="flex-row items-center px-5 py-4">
            <View className="bg-[#FFD700]/10 p-2 rounded-full">
              <MapPin size={20} color="#FFD700" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <AddressAutocomplete
                key={`mapbox-sender-${mapboxInputValue}`}
                placeholder="Quartier (autocomplétion)"
                bbox={bbox}
                onSelected={({ label, lat, lng }) => {
                  setMapboxInputValue(label);
                  setSender({ ...sender, address: label });
                  onPickupSelected?.({ label, lat, lng });
                }}
                onTextChange={(t) => {
                  setMapboxInputValue(t);
                  setSender({ ...sender, address: t });
                }}
                initialText={mapboxInputValue}
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

export default SecondStep;
