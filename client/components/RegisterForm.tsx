import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react-native";
import PrimaryButton from "./ui/PrimaryButton";

type RegisterFormProps = {
  // values
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirm: string;

  // setters
  setFullName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirm: (v: string) => void;

  // visibility toggles
  secure: boolean;
  setSecure: (v: boolean) => void;
  secureConfirm: boolean;
  setSecureConfirm: (v: boolean) => void;

  // terms
  acceptTerms: boolean;
  setAcceptTerms: (v: boolean) => void;

  // ui state
  loading: boolean;
  canSubmit: boolean;

  // errors (gérés par le parent)
  errors?: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirm?: string;
    accept?: string;
  };

  // handlers
  onSubmit: () => void;
  onGoToLogin: () => void;
};

export default function RegisterForm({
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
  secure,
  setSecure,
  secureConfirm,
  setSecureConfirm,
  acceptTerms,
  setAcceptTerms,
  loading,
  canSubmit,
  errors = {},
  onSubmit,
  onGoToLogin,
}: RegisterFormProps) {
  return (
    <View className="mt-4 gap-3">
      {/* Full name */}
      <View className="rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <User size={18} color="#ffffff" />
        <TextInput
          placeholder="Full name"
          placeholderTextColor="#F3F4F6"
          value={fullName}
          onChangeText={setFullName}
          returnKeyType="next"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
        />
      </View>
      {errors.fullName ? (
        <Text className="text-red-200 text-xs -mt-2">{errors.fullName}</Text>
      ) : null}

      {/* Email */}
      <View className="rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <Mail size={18} color="#ffffff" />
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#F3F4F6"
          inputMode="email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
        />
      </View>
      {errors.email ? (
        <Text className="text-red-200 text-xs -mt-2">{errors.email}</Text>
      ) : null}

      {/* Phone (optional) */}
      <View className="rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <Phone size={18} color="#ffffff" />
        <TextInput
          placeholder="Phone (optional)"
          placeholderTextColor="#F3F4F6"
          inputMode="tel"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          returnKeyType="next"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
        />
      </View>
      {errors.phone ? (
        <Text className="text-red-200 text-xs -mt-2">{errors.phone}</Text>
      ) : null}

      {/* Password */}
      <View className="rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <Lock size={18} color="#ffffff" />
        <TextInput
          placeholder="Create a password (≥ 6)"
          placeholderTextColor="#F3F4F6"
          secureTextEntry={secure}
          value={password}
          onChangeText={setPassword}
          returnKeyType="next"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
        />
        <Pressable
          onPress={() => setSecure(!secure)}
          hitSlop={8}
          className="p-2 -mr-1"
          accessibilityRole="button"
        >
          {secure ? (
            <EyeOff size={20} color="#ffffff" />
          ) : (
            <Eye size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>
      {errors.password ? (
        <Text className="text-red-200 text-xs -mt-2">{errors.password}</Text>
      ) : null}

      {/* Confirm */}
      <View className="rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <Lock size={18} color="#ffffff" />
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#F3F4F6"
          secureTextEntry={secureConfirm}
          value={confirm}
          onChangeText={setConfirm}
          returnKeyType="done"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
          onSubmitEditing={onSubmit}
        />
        <Pressable
          onPress={() => setSecureConfirm(!secureConfirm)}
          hitSlop={8}
          className="p-2 -mr-1"
          accessibilityRole="button"
        >
          {secureConfirm ? (
            <EyeOff size={20} color="#ffffff" />
          ) : (
            <Eye size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>
      {errors.confirm ? (
        <Text className="text-red-200 text-xs -mt-2">{errors.confirm}</Text>
      ) : null}

      {/* Terms + CTA */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Switch
            value={acceptTerms}
            onValueChange={setAcceptTerms}
            thumbColor={acceptTerms ? "#60A5FA" : undefined}
            accessibilityLabel="Accept terms"
          />
          <Text className="ml-2 text-white/90 font-quicksand text-xs">
            J’accepte les CGU & Politique
          </Text>
        </View>
      </View>
      {errors.accept ? (
        <Text className="text-red-200 text-xs">{errors.accept}</Text>
      ) : null}

      <PrimaryButton
        onPress={onSubmit}
        disabled={!canSubmit}
        loading={loading}
        accessibilityLabel="Create account"
        className="bg-primary"
      >
        <Text className="font-quicksand-medium ">Create Account</Text>
      </PrimaryButton>

      {loading && (
        <View className="items-center">
          <ActivityIndicator />
          <Text className="text-white/90 mt-2 font-quicksand">
            Creating account…
          </Text>
        </View>
      )}

      {/* Lien Login bas */}
      <View className="items-center">
        <Text className="text-white/80 font-quicksand text-sm">
          Already have an account?{" "}
          <Text
            className="underline"
            onPress={onGoToLogin}
            accessibilityRole="button"
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
}
