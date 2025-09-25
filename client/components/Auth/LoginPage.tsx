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
} from "react-native";
import { Mail, Lock } from "lucide-react-native";
import { assets } from "@/assets/images/assets";
import CustomInput from "../ui/CustomInput";
import GoogleIcon from "../Icons/GoogleIcon";
import FacebookIcon from "../Icons/FacebookIcon";
import { useToast } from "../ui/Toast";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type LoginFormProps = {
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<SetStateAction<string>>;
  loading: boolean;
  canSubmit: boolean;
  onPressLogin: () => void;
  onPressForgot: () => void;
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
}: LoginFormProps) {
  const { showToast } = useToast();

  return (
    <View className="flex-1 bg-customwhite">
      <KeyboardAvoidingView
        className="flex-1 px-6 mt-20"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Illustration */}
        <View className="w-full items-center justify-center mb-6">
          <Image
            source={assets.welcome as ImageSourcePropType}
            style={{ width: "100%", height: 250 }}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View className="items-center mb-6 -mt-10">
          <Text className="text-4xl font-clash text-gray-900">
            Se connecter
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Entrer vos informations de connexion
          </Text>
        </View>

        {/* Inputs */}
        <View className="gap-4">
          <CustomInput
            value={email}
            icon={Mail}
            setValue={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            className="border border-gray-300 rounded-lg bg-gray-50"
          />

          <CustomInput
            value={password}
            icon={Lock}
            setValue={setPassword}
            placeholder="Entrer votre mot de passe"
            secureTextEntry
            className="border border-gray-300 rounded-lg bg-gray-50"
          />
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          onPress={onPressForgot}
          className="mt-2 self-end"
          accessibilityRole="button"
        >
          <Text className="text-primary font-quicksand text-sm underline">
            Forgot password?
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <View className="px-6 pb-6 bg-customwhite">
        {/* CTA principal */}
        <TouchableOpacity
          disabled={!canSubmit || loading}
          onPress={onPressLogin}
          className={`w-full py-4 rounded-lg items-center mt-2 ${
            canSubmit ? "bg-primary" : "bg-gray-300"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-quicksand-medium text-base">
              Connexion
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-2 text-gray-400 font-quicksand">Ou</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Social logins */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 border border-gray-300 rounded-lg py-3 items-center bg-white flex-row justify-center gap-2"
            onPress={() => {
              showToast("Bientôt disponible !", "info");
            }}
          >
            <GoogleIcon size={20} />
            <Text className="font-quicksand-medium text-gray-700">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 border border-gray-300 rounded-lg py-3 items-center bg-white flex-row justify-center gap-2"
            onPress={() => {
              showToast("Bientôt disponible !", "info");
            }}
          >
            <FacebookIcon size={20} />
            <Text className="font-quicksand-medium text-gray-700">
              Facebook
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
