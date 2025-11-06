import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { Plane, Rocket } from "lucide-react-native";
import { ServiceState } from "@/types/createorder.type";
import { assets } from "@/assets/images/assets";
import { ImageSourcePropType } from "react-native";

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
    <View className="flex-1">
      {/* Illustration Header */}
      <View className="relative bg-[#FFF9E6] pt-8 pb-6 items-center">
        <Image
          source={assets.deliveryGuyMockup as ImageSourcePropType}
          style={{ width: "90%", height: 180, opacity: 0.3 }}
          resizeMode="contain"
        />
        
        {/* Step Indicator and Title */}
        <View className="mt-4 px-6 w-full">
          <Text className="text-5xl font-clash text-gray-900 font-bold">
            04<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2">
            Sélection du service
          </Text>
        </View>
      </View>

      {/* Service Selection Cards */}
      <View className="flex-1 bg-white px-6 pt-6">
        <View className="flex-row gap-4">
          {/* Standard Service */}
          <TouchableOpacity
            onPress={() => setService({ ...service, service: "STANDARD" })}
            activeOpacity={0.8}
            className={`flex-1 rounded-3xl p-6 items-center border-2 shadow-lg ${
              service.service === "STANDARD"
                ? "bg-yellow-50 border-[#FFD700]"
                : "bg-white border-gray-200"
            }`}
          >
            <View className="mb-3">
              <Plane size={40} color="#0F172A" strokeWidth={1.5} />
            </View>
            <Text className="text-lg font-quicksand-bold text-gray-900 mb-1">
              Standard
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-3">
              Livraison le lendemain
            </Text>
            <View>
              <Text className="text-xs text-gray-500">Prix estimé</Text>
              <Text className="text-lg font-quicksand-bold text-red-600">
                10,000 Ar
              </Text>
            </View>
          </TouchableOpacity>

          {/* Fast Service */}
          <TouchableOpacity
            onPress={() => setService({ ...service, service: "EXPRESS" })}
            activeOpacity={0.8}
            className={`flex-1 rounded-3xl p-6 items-center border-2 shadow-lg ${
              service.service === "EXPRESS"
                ? "bg-yellow-50 border-[#FFD700]"
                : "bg-white border-gray-200"
            }`}
          >
            <View className="mb-3">
              <Rocket size={40} color="#0F172A" strokeWidth={1.5} />
            </View>
            <Text className="text-lg font-quicksand-bold text-gray-900 mb-1">
              Express
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-3">
              Livraison le jour même
            </Text>
            <View>
              <Text className="text-xs text-gray-500">Prix estimé</Text>
              <Text className="text-lg font-quicksand-bold text-red-600">
                20,000 Ar
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FourthStep;
