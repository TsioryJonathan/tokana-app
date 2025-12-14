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
      {/* Header compact */}
      <View className="relative bg-[#FFF9E6] pt-6 pb-4 items-center">
        <View className="px-6 w-full">
          <Text className="text-4xl font-clash text-gray-900 font-bold">
            05<Text className="text-gray-400">/05</Text>
          </Text>
          <Text className="text-xl font-quicksand-bold text-gray-800 mt-1">
            Récapitulatif & Confirmation
          </Text>
        </View>
      </View>

      {/* Form Section - Layout optimisé */}
      <View className="flex-1 bg-white px-6 pt-4">
        {/* SECTION PRIORITAIRE: Montant facultatif et Remarque EN HAUT */}
        <View className="bg-amber-50 rounded-2xl p-4 mb-3 border border-amber-200">
          <Text className="text-sm font-quicksand-bold text-amber-800 mb-2">
            💰 Montant à encaisser (optionnel)
          </Text>
          <View className="bg-white rounded-xl border border-amber-200">
            <View className="flex-row items-center px-4 py-3">
              <DollarSign size={18} color="#D97706" strokeWidth={2.5} />
              <TextInput
                value={payment.codAmountAr || ""}
                onChangeText={(t) => setPayment({ ...payment, codAmountAr: t })}
                placeholder="Ex: 50000 Ar"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="flex-1 ml-2 font-quicksand text-gray-900 text-base"
              />
            </View>
          </View>
        </View>

        <View className="bg-blue-50 rounded-2xl p-4 mb-3 border border-blue-200">
          <Text className="text-sm font-quicksand-bold text-blue-800 mb-2">
            📝 Remarque (optionnel)
          </Text>
          <View className="bg-white rounded-xl border border-blue-200">
            <TextInput
              value={payment.notes || ""}
              onChangeText={(t) => setPayment({ ...payment, notes: t })}
              placeholder="Instructions spéciales..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="px-4 py-3 font-quicksand text-gray-900 text-sm"
              style={{ minHeight: 50 }}
              maxLength={500}
            />
          </View>
        </View>

        {/* Prix estimé - Visible */}
        <View className="bg-emerald-50 rounded-2xl p-4 mb-3 border border-emerald-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-quicksand-semibold text-emerald-800">Prix estimé</Text>
            <Text className="text-2xl font-quicksand-bold text-emerald-600">
              {estimatedPrice.toLocaleString()} Ar
            </Text>
          </View>
        </View>

        {/* Récap compact - Expéditeur */}
        <View className="bg-gray-50 rounded-2xl p-3 mb-2 border border-gray-200">
          <Text className="text-xs font-quicksand-bold text-gray-700 mb-1">Expéditeur</Text>
          <Text className="text-sm text-gray-900">{sender.name} • {sender.phone}</Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>{sender.address}</Text>
        </View>

        {/* Récap compact - Destinataire */}
        <View className="bg-gray-50 rounded-2xl p-3 mb-2 border border-gray-200">
          <Text className="text-xs font-quicksand-bold text-gray-700 mb-1">Destinataire</Text>
          <Text className="text-sm text-gray-900">{recipient.name} • {recipient.phone}</Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>{recipient.address}</Text>
        </View>

        {/* Récap compact - Colis & Service */}
        <View className="bg-gray-50 rounded-2xl p-3 mb-2 border border-gray-200">
          <View className="flex-row flex-wrap gap-2">
            <View className="bg-white px-2 py-1 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-500">Type</Text>
              <Text className="text-sm font-quicksand-semibold text-gray-900">{parcel.type}</Text>
            </View>
            <View className="bg-white px-2 py-1 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-500">Poids</Text>
              <Text className="text-sm font-quicksand-semibold text-gray-900">{parcel.weight}</Text>
            </View>
            <View className="bg-white px-2 py-1 rounded-lg border border-gray-200">
              <Text className="text-xs text-gray-500">Taille</Text>
              <Text className="text-sm font-quicksand-semibold text-gray-900">{parcel.size}</Text>
            </View>
            <View className={`px-2 py-1 rounded-lg border ${service.service === "EXPRESS" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
              <Text className="text-xs text-gray-500">Service</Text>
              <Text className={`text-sm font-quicksand-bold ${service.service === "EXPRESS" ? "text-amber-700" : "text-emerald-700"}`}>
                {service.service === "EXPRESS" ? "Express" : "Standard"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FifthStep;
