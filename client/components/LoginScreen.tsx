import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Label from "./ui/Label";
import PrimaryButton from "./ui/PrimaryButton";
import GhostButton from "./ui/GhostButton";
import { assets } from "@/assets/images/assets";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onPressLogin = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  const onPressForgot = () => {};
  const onPressRegister = () => {};

  const canSubmit =
    email.trim().length > 0 && password.trim().length >= 6 && !loading;

  return (
    <SafeAreaView className="flex-1 bg-customwhite">
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "default"}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            className="flex-1 px-5 py-8"
            style={{ maxWidth: 480, alignSelf: "center" }}
          >
            {/* Branding */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-white shadow-md items-center justify-center">
                <Image
                  source={assets.logo as any}
                  alt="Tokana Logo"
                  style={{ width: 44, height: 44 }}
                />
              </View>
              <Text className="mt-4 text-3xl text-secondary font-quicksand-bold tracking-wide uppercase">
                Tokana Delivery
              </Text>
              <Text className="text-accent mt-1 font-quicksand">
                Livraison à vélo — rapide & assurée
              </Text>
            </View>

            {/* Carte Form */}
            <View className="bg-white rounded-2xl p-5 shadow-lg border border-accent/20">
              {/* Email */}
              <View>
                <Label htmlFor="email">Email</Label>
                <View className="w-full rounded-xl border border-accent/50 flex-row items-center px-3 bg-white">
                  <Mail size={18} color="#949789" />
                  <TextInput
                    nativeID="email"
                    accessibilityLabel="Champ email"
                    inputMode="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="ex: rider@tokana.mg"
                    placeholderTextColor="#949789"
                    value={email}
                    onChangeText={setEmail}
                    selectionColor="#fcce2a"
                    returnKeyType="next"
                    className="flex-1 px-3 py-3 text-customblack font-quicksand"
                  />
                </View>
              </View>

              <View className="h-4" />

              {/* Password */}
              <View>
                <Label htmlFor="password">Mot de passe</Label>
                <View className="w-full rounded-xl border border-accent/50 flex-row items-center px-3 bg-white">
                  <Lock size={18} color="#949789" />
                  <TextInput
                    nativeID="password"
                    accessibilityLabel="Champ mot de passe"
                    secureTextEntry={secure}
                    placeholder="Minimum 6 caractères"
                    placeholderTextColor="#949789"
                    value={password}
                    onChangeText={setPassword}
                    selectionColor="#fcce2a"
                    returnKeyType="done"
                    onSubmitEditing={onPressLogin}
                    className="flex-1 px-3 py-3 text-customblack font-quicksand"
                  />
                  <Pressable
                    onPress={() => setSecure((s) => !s)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      secure
                        ? "Afficher le mot de passe"
                        : "Masquer le mot de passe"
                    }
                    hitSlop={8}
                    className="p-2 -mr-1"
                  >
                    {secure ? (
                      <EyeOff size={20} color="#949789" />
                    ) : (
                      <Eye size={20} color="#949789" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Remember + Forgot */}
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center">
                  <Switch
                    value={remember}
                    onValueChange={setRemember}
                    thumbColor={remember ? "#fcce2a" : undefined}
                    accessibilityLabel="Se souvenir de moi"
                  />
                  <Text className="ml-2 text-secondary font-quicksand">
                    Se souvenir de moi
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onPressForgot}
                  accessibilityRole="button"
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text className="text-secondary underline font-quicksand-medium">
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CTA */}
              <View className="mt-6">
                <PrimaryButton
                  onPress={onPressLogin}
                  disabled={!canSubmit}
                  loading={loading}
                  accessibilityLabel="Se connecter"
                >
                  <Text className="font-quicksand-medium">
                    {loading ? "Connexion..." : "Se connecter"}
                  </Text>
                </PrimaryButton>

                {loading && (
                  <View className="mt-3 items-center">
                    <ActivityIndicator />
                    <Text className="text-accent mt-2 font-quicksand">
                      Vérification en cours…
                    </Text>
                  </View>
                )}

                <View className="mt-3">
                  <GhostButton
                    onPress={onPressRegister}
                    accessibilityLabel="Créer un compte"
                  >
                    <Text className="font-quicksand">Créer un compte</Text>
                  </GhostButton>
                </View>
              </View>
            </View>

            {/* Mentions */}
            <View className="items-center mt-6 px-4">
              <Text className="text-accent text-center font-quicksand">
                En vous connectant, vous acceptez nos{" "}
                <Text className="underline font-quicksand">CGU</Text> &{" "}
                <Text className="underline font-quicksand">
                  Politique de confidentialité
                </Text>
                .
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
