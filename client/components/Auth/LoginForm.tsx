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
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import PrimaryButton from "../ui/PrimaryButton";

type LoginFormProps = {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  secure: boolean;
  setSecure: (val: boolean) => void;
  remember: boolean;
  setRemember: (val: boolean) => void;
  loading: boolean;
  canSubmit: boolean;
  onPressLogin: () => void;
  onPressForgot: () => void;
  onPressRegister: () => void;
};

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  secure,
  setSecure,
  remember,
  setRemember,
  loading,
  canSubmit,
  onPressLogin,
  onPressForgot,
  onPressRegister,
}: LoginFormProps) {
  return (
    <View className="mt-4 gap-3">
      {/* Email */}
      <View className="w-full rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
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

      {/* Password */}
      <View className="w-full rounded-xl border border-white/40 bg-white/25 flex-row items-center px-3">
        <Lock size={18} color="#ffffff" />
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#F3F4F6"
          secureTextEntry={secure}
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
          className="flex-1 px-3 py-3 text-white font-quicksand outline-none font-semibold"
          onSubmitEditing={onPressLogin}
        />
        <Pressable
          onPress={() => setSecure(!secure)}
          hitSlop={8}
          className="p-2 -mr-1"
          accessibilityRole="button"
          accessibilityLabel={secure ? "Show password" : "Hide password"}
        >
          {secure ? (
            <EyeOff size={20} color="#ffffff" />
          ) : (
            <Eye size={20} color="#ffffff" />
          )}
        </Pressable>
      </View>

      {/* Options sous-champs */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Switch
            value={remember}
            onValueChange={setRemember}
            thumbColor={remember ? "#60A5FA" : undefined}
            accessibilityLabel="Remember me"
          />
          <Text className="ml-2 text-white/90 font-quicksand">Remember me</Text>
        </View>

        <TouchableOpacity
          onPress={onPressForgot}
          accessibilityRole="button"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text className="text-white underline font-quicksand-medium">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* CTA principal */}
      <PrimaryButton
        onPress={onPressLogin}
        disabled={!canSubmit}
        loading={loading}
        accessibilityLabel="Login"
        className="bg-primary"
      >
        <Text className="font-quicksand-medium">Login</Text>
      </PrimaryButton>

      {loading && (
        <View className="items-center">
          <ActivityIndicator />
          <Text className="text-white/90 mt-2 font-quicksand">Checking…</Text>
        </View>
      )}

      {/* OU - social login */}
      <View className="items-center mt-1">
        <Text className="text-white/70 font-quicksand text-xs">
          Or login with
        </Text>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity className="flex-1 bg-white/90 rounded-xl items-center justify-center py-3">
          <Text className="font-quicksand-medium">Google</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white/90 rounded-xl items-center justify-center py-3">
          <Text className="font-quicksand-medium">Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Lien register */}
      <View className="items-center">
        <Text className="text-white/80 font-quicksand text-sm">
          Don’t have an account?{" "}
          <Text
            className="underline"
            onPress={onPressRegister}
            accessibilityRole="button"
          >
            Create an account
          </Text>
        </Text>
      </View>
    </View>
  );
}
