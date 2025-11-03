import React, { SetStateAction, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Phone, Mail, Lock, UserPlus } from "lucide-react-native";
import { assets } from "@/assets/images/assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RegisterFormProps = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirm: string;

  setFullName: React.Dispatch<SetStateAction<string>>;
  setEmail: React.Dispatch<SetStateAction<string>>;
  setPhone: React.Dispatch<SetStateAction<string>>;
  setPassword: React.Dispatch<SetStateAction<string>>;
  setConfirm: React.Dispatch<SetStateAction<string>>;

  loading?: boolean;
  onSubmit?: () => void;
};

export default function RegisterPage({
  fullName,
  email,
  phone = "",
  password,
  confirm,
  setFullName,
  setEmail,
  setPhone,
  setPassword,
  setConfirm,
  loading = false,
  onSubmit,
}: RegisterFormProps) {
  const insets = useSafeAreaInsets();
  
  const canSubmit = useMemo(() => {
    const emailTrim = email.trim();
    const phoneTrim = phone.trim();
    const emailValid = emailTrim.length >= 3 && emailTrim.includes("@");
    const phoneValid = /^(\+261|0)(3[0-9]|20)\d{7}$/.test(phoneTrim);
    const hasAtLeastOneContact = emailValid || phoneValid;
    return (
      fullName.trim().length >= 3 &&
      hasAtLeastOneContact &&
      password.length >= 6
    );
  }, [fullName, email, phone, password]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={["#FFF9E6", "#FFFDF7", "#FFFFFF"]}
        locations={[0, 0.5, 1]}
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      {/* Decorative circles */}
      <View className="absolute top-[-80px] left-[-60px] w-[250px] h-[250px] rounded-full bg-[#FFD700]/15" />
      <View className="absolute top-[150px] right-[-40px] w-[180px] h-[180px] rounded-full bg-[#FFA500]/10" />
      <View className="absolute bottom-[100px] left-[-50px] w-[200px] h-[200px] rounded-full bg-[#FFD700]/5" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Illustration Header with enhanced design */}
        <View className="w-full items-center justify-center pt-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
          <View className="bg-white/40 backdrop-blur-xl rounded-3xl p-3 shadow-lg shadow-gray-300/30">
            <Image
              source={assets.registerStepOne as ImageSourcePropType}
              style={{ width: 200, height: 100 }}
              resizeMode="contain"
            />
          </View>
          
          <View className="mt-3 px-6 w-full">
            <View className="flex-row items-center mb-1">
              <UserPlus size={24} color="#FFD700" strokeWidth={2.5} />
              <View className="ml-2 flex-1 h-1 bg-[#FFD700]/20 rounded-full" />
            </View>
            <Text className="text-5xl font-clash text-gray-900 font-bold leading-tight">
              Inscription
            </Text>
            <Text className="text-base font-quicksand text-gray-500 mt-1">
              Crée ton compte pour commencer
            </Text>
          </View>
        </View>

        {/* Form with enhanced design */}
        <View 
          className="flex-1 px-6 pt-2 pb-24"
          style={{ paddingBottom: insets.bottom + 100 }}
        >
          <View className="gap-3 mb-4">
            {/* Name Input */}
            <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50">
              <View className="flex-row items-center px-5 py-3.5">
                <View className="bg-[#FFD700]/10 p-2 rounded-full">
                  <User size={19} color="#FFD700" strokeWidth={2.5} />
                </View>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nom complet"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Phone Input with Country Code */}
            <View className="flex-row gap-3">
              <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50 px-3.5 py-3.5 flex-row items-center justify-center w-24">
                <Text className="text-lg mr-1">🇲🇬</Text>
                <Text className="font-quicksand-bold text-gray-700 text-sm">+261</Text>
              </View>
              <View className="flex-1 bg-white rounded-3xl shadow-lg shadow-gray-300/50">
                <View className="flex-row items-center px-5 py-3.5">
                  <View className="bg-[#FFD700]/10 p-2 rounded-full">
                    <Phone size={19} color="#FFD700" strokeWidth={2.5} />
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Téléphone"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
                  />
                </View>
              </View>
            </View>

            {/* Email Input */}
            <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50">
              <View className="flex-row items-center px-5 py-3.5">
                <View className="bg-[#FFD700]/10 p-2 rounded-full">
                  <Mail size={19} color="#FFD700" strokeWidth={2.5} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50">
              <View className="flex-row items-center px-5 py-3.5">
                <View className="bg-[#FFD700]/10 p-2 rounded-full">
                  <Lock size={19} color="#FFD700" strokeWidth={2.5} />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  className="flex-1 ml-3 font-quicksand text-gray-900 text-base"
                />
              </View>
            </View>
          </View>

          {/* Sign Up Button with gradient */}
          <View className="mt-3">
            <TouchableOpacity
              disabled={!canSubmit || loading}
              onPress={onSubmit}
              activeOpacity={0.8}
              className="w-full rounded-3xl overflow-hidden shadow-xl shadow-[#FFD700]/40"
            >
              <LinearGradient
                colors={canSubmit ? ["#FFD700", "#FFA500"] : ["#D1D5DB", "#9CA3AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-4 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-quicksand-bold text-lg tracking-wide uppercase">
                    S'inscrire
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
