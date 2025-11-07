import { View, Text, Image, ImageSourcePropType, TextInput } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { ChevronRight, DollarSign, FileText } from "lucide-react-native";
import { PaymentState } from "../../types/createorder.type";
import { assets } from "../../assets/images/assets";

interface SenderInfo {
  name?: string;
  phone?: string;
  address?: string;
}

interface RecipientInfo {
  name?: string;
  phone?: string;
  address?: string;
}

interface ParcelInfo {
  type?: string;
  weight?: string;
  size?: string;
  category?: string;
}

interface ServiceInfo {
  service?: string;
  distanceKmBracket?: string;
}

interface FifthStepProps {
  payment: PaymentState;
  setPayment: Dispatch<SetStateAction<PaymentState>>;
  sender?: SenderInfo;
  recipient?: RecipientInfo;
  parcel?: ParcelInfo;
  service?: ServiceInfo;
  estimatedPrice?: number;
}

const FifthStep = ({
  payment,
  setPayment,
  sender = { name: "admin", phone: "123456789", address: "John Doe, 123 Main Street, Apt 4B, New York, NY 10001, United States" },
  recipient = { name: "admin", phone: "123456789", address: "John Doe, 123 Main Street, Apt 4B, New York, NY 10001, United States" },
  parcel = { type: "Fragile", weight: "1KG", size: "300*300", category: "SMALL" },
  service = { service: "EXPRESS", distanceKmBracket: "<5" },
  estimatedPrice = 20000,
}: FifthStepProps) => {
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
            05<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-2xl font-quicksand-bold text-gray-800 mt-2">
            Confirmation and Payment
          </Text>
        </View>
      </View>

      {/* Form Section */}
      <View className="flex-1 bg-white px-6 pt-6">
        {/* Sender Information */}
        <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50 p-5 mb-4">
          <Text className="text-lg font-quicksand-bold text-gray-900 mb-3">
            Sender information
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-gray-600 flex-1">Name</Text>
            <Text className="text-sm text-gray-900">{sender.name}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-gray-600 flex-1">Phone</Text>
            <Text className="text-sm text-gray-900">{sender.phone}</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-sm text-gray-600 flex-1">Address</Text>
            <Text className="text-sm text-gray-900 text-right flex-2">
              {sender.address}
            </Text>
          </View>
        </View>

        {/* Recipient Information */}
        <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50 p-5 mb-4">
          <Text className="text-lg font-quicksand-bold text-gray-900 mb-3">
            Recipient information
          </Text>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-gray-600 flex-1">Name</Text>
            <Text className="text-sm text-gray-900">{recipient.name}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm text-gray-600 flex-1">Phone</Text>
            <Text className="text-sm text-gray-900">{recipient.phone}</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-sm text-gray-600 flex-1">Address</Text>
            <Text className="text-sm text-gray-900 text-right flex-2">
              {recipient.address}
            </Text>
          </View>
        </View>

        {/* Parcel & Service Details */}
        <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50 p-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Type</Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-900 mr-1">{parcel.type}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Weight</Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-900 mr-1">{parcel.weight}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Size</Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-900 mr-1">{parcel.size}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Service Selection</Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-900 mr-1">{service.service === "EXPRESS" ? "Fast" : "Standard"}</Text>
              <ChevronRight size={16} color="#9CA3AF" />
            </View>
          </View>
          <View className="flex-row items-center justify-between pt-2 border-t border-gray-200">
            <Text className="text-sm text-gray-600">Estimated price</Text>
            <Text className="text-lg font-quicksand-bold text-red-600">
              {estimatedPrice.toLocaleString()} Ar
            </Text>
          </View>
        </View>

        {/* Payment Section */}
        <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50 p-5 mt-4">
          <Text className="text-lg font-quicksand-bold text-gray-900 mb-3">
            Paiement
          </Text>
          
          {/* COD Amount Input */}
          <View className="bg-gray-50 rounded-2xl mb-4 border border-gray-200">
            <View className="flex-row items-center px-5 py-4">
              <View className="bg-[#FFD700]/10 p-2 rounded-full">
                <DollarSign size={20} color="#FFD700" strokeWidth={2.5} />
              </View>
              <TextInput
                value={payment.codAmountAr || ""}
                onChangeText={(t) => setPayment({ ...payment, codAmountAr: t })}
                placeholder="Montant à encaisser (COD) - Optionnel"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
              />
            </View>
          </View>

          {/* Notes Input */}
          <View className="bg-gray-50 rounded-2xl border border-gray-200">
            <View className="flex-row items-start px-5 py-4">
              <View className="bg-[#FFD700]/10 p-2 rounded-full mt-1">
                <FileText size={20} color="#FFD700" strokeWidth={2.5} />
              </View>
              <TextInput
                value={payment.notes || ""}
                onChangeText={(t) => setPayment({ ...payment, notes: t })}
                placeholder="Notes (facultatif) - Ex: Instructions spéciales, informations de livraison..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="flex-1 ml-3 font-quicksand text-gray-900 text-base min-h-[100px]"
                maxLength={1000}
              />
            </View>
            {payment.notes && payment.notes.length > 0 && (
              <Text className="text-xs text-gray-400 px-5 pb-2 text-right">
                {payment.notes.length}/1000
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default FifthStep;
