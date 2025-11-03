import React, { SetStateAction } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Lock, Sparkles } from "lucide-react-native";
import { assets } from "@/assets/images/assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LoginFormProps = {
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<SetStateAction<string>>;
  loading: boolean;
  canSubmit: boolean;
  onPressLogin: () => void;
  onPressForgot: () => void;
  onPressSignUp?: () => void;
};

export default function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  canSubmit,
  onPressLogin,
  onPressForgot,
  onPressSignUp,
}: LoginFormProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={["#FFF9E6", "#FFFDF7", "#FFFFFF"]}
        locations={[0, 0.4, 0.8]}
        className="absolute top-0 left-0 right-0 bottom-0"
      />

      {/* Decorative circles */}
      <View className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] rounded-full bg-[#FFD700]/10" />
      <View className="absolute top-[100px] left-[-80px] w-[200px] h-[200px] rounded-full bg-[#FFA500]/10" />

      {/* Illustration Background with better visibility */}
      <View className="absolute top-0 left-0 right-0 h-[500px] opacity-20">
        <Image
          source={assets.welcome as ImageSourcePropType}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View 
          className="flex-1 justify-between px-6"
          style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
        >
          {/* Header with decorative elements */}
          <View className="mt-4">
            <View className="flex-row items-center mb-2">
              <Sparkles size={32} color="#FFD700" fill="#FFD700" />
              <View className="ml-2 w-16 h-1 bg-gradient-to-r from-[#FFD700] to-transparent rounded-full" />
            </View>
            <Text className="text-6xl font-clash text-gray-900 font-bold leading-tight">
              Bon retour
            </Text>
            <Text className="text-6xl font-clash text-gray-900 font-bold leading-tight">
              !
            </Text>
            <Text className="text-lg font-quicksand text-gray-500 mt-3">
              Connecte-toi pour continuer
            </Text>
          </View>

          {/* Form Content */}
          <View className="flex-1 justify-center -mt-8">
            {/* Input Fields with enhanced design */}
            <View className="gap-5 mb-8">
              {/* Phone/Email Input */}
              <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50">
                <View className="flex-row items-center px-6 py-5">
                  <View className="bg-[#FFD700]/10 p-2 rounded-full">
                    <User size={22} color="#FFD700" strokeWidth={2.5} />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Téléphone ou email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="default"
                    autoCapitalize="none"
                    className="flex-1 ml-4 font-quicksand text-gray-900 text-lg"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="bg-white rounded-3xl shadow-lg shadow-gray-300/50">
                <View className="flex-row items-center px-6 py-5">
                  <View className="bg-[#FFD700]/10 p-2 rounded-full">
                    <Lock size={22} color="#FFD700" strokeWidth={2.5} />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Mot de passe"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="flex-1 ml-4 font-quicksand text-gray-900 text-lg"
                  />
                </View>
              </View>
            </View>

            {/* Login Button with gradient */}
            <TouchableOpacity
              disabled={!canSubmit || loading}
              onPress={onPressLogin}
              activeOpacity={0.8}
              className="w-full rounded-3xl overflow-hidden mb-4 shadow-xl shadow-[#FFD700]/40"
            >
              <LinearGradient
                colors={canSubmit ? ["#FFD700", "#FFA500"] : ["#D1D5DB", "#9CA3AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-5 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-quicksand-bold text-xl tracking-wide uppercase">
                    Connexion
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity 
              onPress={onPressSignUp}
              activeOpacity={0.8}
              className="w-full py-5 rounded-3xl items-center border-2 border-[#FFD700] bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50"
            >
              <Text className="text-[#FFD700] font-quicksand-bold text-xl uppercase tracking-wide">
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <View className="items-center pb-4">
            <Text className="text-gray-500 font-quicksand text-base mb-2">
              Mot de passe oublié ?
            </Text>
            <TouchableOpacity 
              onPress={onPressForgot} 
              accessibilityRole="button"
              activeOpacity={0.7}
              className="bg-[#FFD700]/10 px-6 py-2 rounded-full"
            >
              <Text className="text-[#FFD700] font-quicksand-bold text-lg">
                Récupérer maintenant →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
