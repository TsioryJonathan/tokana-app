import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { Plane, Rocket } from "lucide-react-native";
import { ServiceState } from "../../types/createorder.type";
import { assets } from "../../assets/images/assets";
import { ImageSourcePropType } from "react-native";

export type ServerQuote = {
  total?: number;
  pickup?: number;
  delivery?: number;
  express?: number;
  manual?: boolean;
  instructions?: string | null;
  contactPhone?: string | null;
  inferredZone?: 'ville' | 'peripherie' | 'super-peripherie' | null;
};

const FourthStep = ({
  service,
  setService,
  lockDistance,
  serverQuote,
  quoteLoading,
}: {
  service: ServiceState;
  setService: Dispatch<SetStateAction<ServiceState>>;
  lockDistance?: boolean;
  serverQuote: ServerQuote | null;
  quoteLoading: boolean;
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
        {/* Badge recommandation Standard */}
        <View className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <Text className="text-sm font-quicksand-semibold text-emerald-700 text-center">
            💡 Le service Standard est recommandé pour les envois non urgents
          </Text>
        </View>

        {/* Prix réel calculé */}
        {serverQuote && (
          <View className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFD700]/10 border border-[#FFD700]/30">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-600 font-quicksand">Prix calculé pour votre commande</Text>
                {serverQuote.inferredZone && (
                  <Text className="text-xs text-[#FFD700] font-quicksand-semibold mt-0.5">
                    Zone: {serverQuote.inferredZone === 'ville' ? 'Ville' : serverQuote.inferredZone === 'peripherie' ? 'Périphérie' : 'Super Périphérie'}
                  </Text>
                )}
              </View>
              <View className="items-end">
                {quoteLoading ? (
                  <Text className="text-lg text-gray-400">...</Text>
                ) : (
                  <Text className="text-2xl font-quicksand-bold text-gray-900">
                    {serverQuote.total ? serverQuote.total.toLocaleString('fr-FR') : '---'} Ar
                  </Text>
                )}
              </View>
            </View>
            {serverQuote.delivery && (
              <View className="mt-2 pt-2 border-t border-[#FFD700]/30">
                <Text className="text-xs text-gray-500">
                  Frais de livraison: {serverQuote.delivery.toLocaleString('fr-FR')} Ar
                  {serverQuote.pickup && ` + Frais de collecte: ${serverQuote.pickup.toLocaleString('fr-FR')} Ar`}
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="flex-row gap-4">
          {/* Standard Service - Logo plus visible */}
          <TouchableOpacity
            onPress={() => setService({ ...service, service: "STANDARD" })}
            activeOpacity={0.8}
            className={`flex-1 rounded-3xl p-6 items-center border-3 shadow-xl ${
              service.service === "STANDARD"
                ? "bg-emerald-50 border-emerald-500"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Badge populaire */}
            <View className="absolute -top-2 right-2 bg-emerald-500 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-quicksand-bold text-white">POPULAIRE</Text>
            </View>
            <View className={`mb-3 p-3 rounded-full ${
              service.service === "STANDARD" ? "bg-emerald-100" : "bg-gray-100"
            }`}>
              <Plane size={44} color={service.service === "STANDARD" ? "#059669" : "#64748B"} strokeWidth={2} />
            </View>
            <Text className={`text-xl font-quicksand-bold mb-1 ${
              service.service === "STANDARD" ? "text-emerald-700" : "text-gray-900"
            }`}>
              Standard
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-3">
              Livraison J+1
            </Text>
            <View className="items-center">
              <Text className="text-xs text-gray-500">À partir de</Text>
              {quoteLoading ? (
                <Text className="text-lg text-gray-400">...</Text>
              ) : (
                <Text className={`text-xl font-quicksand-bold ${
                  service.service === "STANDARD" ? "text-emerald-600" : "text-gray-700"
                }`}>
                  {serverQuote?.total
                    ? serverQuote.total.toLocaleString('fr-FR') + ' Ar'
                    : serverQuote?.delivery
                      ? serverQuote.delivery.toLocaleString('fr-FR') + ' Ar'
                      : '---'}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Express Service */}
          <TouchableOpacity
            onPress={() => setService({ ...service, service: "EXPRESS" })}
            activeOpacity={0.8}
            className={`flex-1 rounded-3xl p-6 items-center border-2 shadow-lg ${
              service.service === "EXPRESS"
                ? "bg-amber-50 border-amber-500"
                : "bg-white border-gray-200"
            }`}
          >
            <View className={`mb-3 p-3 rounded-full ${
              service.service === "EXPRESS" ? "bg-amber-100" : "bg-gray-100"
            }`}>
              <Rocket size={44} color={service.service === "EXPRESS" ? "#D97706" : "#64748B"} strokeWidth={2} />
            </View>
            <Text className={`text-xl font-quicksand-bold mb-1 ${
              service.service === "EXPRESS" ? "text-amber-700" : "text-gray-900"
            }`}>
              Express
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-3">
              Livraison J+0 (même jour)
            </Text>
            <View className="items-center">
              <Text className="text-xs text-gray-500">À partir de</Text>
              {quoteLoading ? (
                <Text className="text-lg text-gray-400">...</Text>
              ) : (
                <Text className={`text-xl font-quicksand-bold ${
                  service.service === "EXPRESS" ? "text-amber-600" : "text-gray-700"
                }`}>
                  {serverQuote && serverQuote.total && serverQuote.express
                    ? (serverQuote.total + serverQuote.express).toLocaleString('fr-FR') + ' Ar'
                    : serverQuote?.express
                      ? (serverQuote.express + (serverQuote.delivery || 0)).toLocaleString('fr-FR') + ' Ar'
                      : '---'}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Info zone détectée */}
        {serverQuote?.inferredZone && (
          <View className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <Text className="text-xs font-quicksand text-blue-700 text-center">
              📍 Zone détectée: {serverQuote.inferredZone === 'ville' ? 'Ville (Tana)' : serverQuote.inferredZone === 'peripherie' ? 'Périphérie' : 'Super Périphérie'}
            </Text>
          </View>
        )}

        {/* Info supplémentaire */}
        {serverQuote?.manual && (
          <View className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Text className="text-xs font-quicksand text-amber-700">
              ⚠️ {serverQuote.instructions || 'Cette commande nécessite une vérification manuelle.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FourthStep;
