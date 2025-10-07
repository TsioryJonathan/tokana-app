import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Image, ImageSourcePropType, Platform, KeyboardAvoidingView, ScrollView, TextInput } from "react-native";
import { Lock, MessageCircle, Mail } from "lucide-react-native";
import { assets } from "@/assets/images/assets";
import CustomInput from "@/components/ui/CustomInput";

type VerifyPageProps = {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  canSubmit: boolean;
  loadingVerify: boolean;
  onPressVerify: () => void;
  loadingSms: boolean;
  onPressSendSms: () => void;
  loadingEmail: boolean;
  onPressSendEmail: () => void;
  smsCooldown?: number;
  emailCooldown?: number;
  lastChannel?: 'sms' | 'email' | null;
  maskedTo?: string | null;
  expiresInSec?: number; // remaining seconds until OTP expiration
  canSendSms?: boolean; // whether user has a phone to send SMS
  canSendEmail?: boolean; // whether user has an email to send email OTP
  codeInputRef?: React.RefObject<TextInput | null>;
  scrollToTopSignal?: number; // increment to trigger scroll-to-top
  showExpiryWarning?: boolean;
};

export default function VerifyPage({
  code,
  setCode,
  canSubmit,
  loadingVerify,
  onPressVerify,
  loadingSms,
  onPressSendSms,
  loadingEmail,
  onPressSendEmail,
  smsCooldown = 0,
  emailCooldown = 0,
  lastChannel = null,
  maskedTo = null,
  expiresInSec = 0,
  canSendSms = true,
  canSendEmail = true,
  codeInputRef,
  scrollToTopSignal,
  showExpiryWarning = false,
}: VerifyPageProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  React.useEffect(() => {
    if (scrollToTopSignal != null) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollToTopSignal]);
  return (
    <View className="flex-1 bg-customwhite">
      <KeyboardAvoidingView
        className="flex-1 px-6 mt-20"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Illustration */}
        <View className="w-full items-center justify-center mb-6">
          <Image
            source={assets.welcome as ImageSourcePropType}
            style={{ width: "100%", height: 220 }}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View className="items-center mb-6 -mt-6">
          <Text className="text-4xl font-clash text-gray-900">Vérifier mon compte</Text>
          <Text className="text-sm text-gray-500 mt-1 text-center">
            Entrez le code à 6 chiffres reçu par SMS ou Email.
          </Text>
          {maskedTo && (
            <Text className="text-xs text-gray-500 mt-1 text-center">
              Dernier envoi via {lastChannel?.toUpperCase()} à {maskedTo}
            </Text>
          )}
          {expiresInSec > 0 && (
            <Text className="text-xs text-gray-500 mt-1 text-center">
              Expire dans {Math.floor(expiresInSec / 60)}m{(expiresInSec % 60).toString().padStart(2, '0')}s
            </Text>
          )}
        </View>

        {/* Actions envoyer OTP */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            disabled={loadingSms || smsCooldown > 0 || !canSendSms}
            onPress={onPressSendSms}
            className={`flex-1 border border-gray-300 rounded-lg py-3 items-center bg-white ${loadingSms ? "opacity-60" : ""}`}
            accessibilityRole="button"
          >
            {loadingSms ? (
              <ActivityIndicator />
            ) : (
              <View className="flex-row items-center gap-2">
                <MessageCircle color="#111827" size={18} />
                <Text className="font-quicksand-medium text-gray-700 text-sm text-center" numberOfLines={1}>
                  {!canSendSms ? 'SMS indisponible' : (smsCooldown > 0 ? `SMS dans ${smsCooldown}s` : 'Envoyer SMS')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loadingEmail || emailCooldown > 0 || !canSendEmail}
            onPress={onPressSendEmail}
            className={`flex-1 border border-gray-300 rounded-lg py-3 items-center bg-white ${loadingEmail ? "opacity-60" : ""}`}
            accessibilityRole="button"
          >
            {loadingEmail ? (
              <ActivityIndicator />
            ) : (
              <View className="flex-row items-center gap-2">
                <Mail color="#111827" size={18} />
                <Text className="font-quicksand-medium text-gray-700 text-sm text-center" numberOfLines={1}>
                  {!canSendEmail ? 'Email indisponible' : (emailCooldown > 0 ? `Email dans ${emailCooldown}s` : 'Envoyer Email')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Input code */}
        <CustomInput
          value={code}
          icon={Lock}
          setValue={setCode}
          placeholder="Code à 6 chiffres"
          keyboardType="number-pad"
          className="border border-gray-300 rounded-lg bg-gray-50"
          maxLength={6}
          inputRef={codeInputRef}
        />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA vérifier */}
      <View className="px-6 pb-6 bg-customwhite">
        {showExpiryWarning && (
          <Text className="text-red-500 text-xs font-quicksand text-center">
            OTP expiré, renvoyez un code.
          </Text>
        )}
        <TouchableOpacity
          // disabled={!canSubmit || showExpiryWarning}
          onPress={onPressVerify}
          className={`w-full py-4 rounded-lg items-center mt-4 ${canSubmit && !showExpiryWarning ? "bg-primary" : "bg-gray-300"}`}
        >
          {loadingVerify ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-quicksand-medium text-base">Vérifier</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
