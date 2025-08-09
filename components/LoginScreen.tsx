import React, { useCallback, useMemo, useRef, useState } from "react";
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
  Alert,
  Switch,
  Image,
  StatusBar,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as SecureStore from "expo-secure-store";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "./ui/Label";
import ErrorText from "./ui/ErrorText";
import PrimaryButton from "./ui/PrimaryButton";
import GhostButton from "./ui/GhostButton";
import { assets } from "@/assets/images/assets";

// -----------------------------
// Schéma & types
// -----------------------------
const loginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});
type LoginValues = z.infer<typeof loginSchema>;

// -----------------------------
// Helpers stockage sécurisé
// -----------------------------
const TOKEN_KEY = "tokana_token";
const REMEMBER_KEY = "tokana_remember";

async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {}
}
async function getRemember(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(REMEMBER_KEY);
    return v === "1";
  } catch {
    return false;
  }
}
async function setRemember(on: boolean) {
  try {
    await SecureStore.setItemAsync(REMEMBER_KEY, on ? "1" : "0");
  } catch {}
}

export default function LoginScreen() {
  const [secure, setSecure] = useState(true);
  const [remember, setRememberState] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: { email: "", password: "" },
  });

  React.useEffect(() => {
    // Recharger le choix "remember me" si déjà activé
    getRemember()
      .then(setRememberState)
      .catch(() => {});
  }, []);

  const canSubmit = useMemo(
    () => isValid && isDirty && !loading && !isSubmitting,
    [isValid, isDirty, loading, isSubmitting]
  );

  const onSubmit = useCallback(
    async (values: LoginValues) => {
      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      // Timeout de sécurité
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        // 🔐 Exemple d'appel API (à remplacer par ton endpoint)
        // Utilise HTTPS en prod, gère le refresh token côté app.
        const res = await fetch("https://api.tokana.mg/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError("password", { message: "Identifiants incorrects" });
          } else {
            Alert.alert("Erreur", "Impossible de se connecter. Réessaye.");
          }
          return;
        }

        const data = (await res.json()) as {
          token: string;
          user: { id: string; name: string };
        };

        // Stockage sécurisé si Remember est actif
        if (remember && data?.token) {
          await saveToken(data.token);
        }
        await setRemember(remember);

        // 👉 Navigue vers l’app (ex: react-navigation)
        // navigation.reset({ index: 0, routes: [{ name: "Home" }] });

        Alert.alert(
          "Bienvenue",
          `Bonjour ${data?.user?.name ?? "Tokana Rider"} !`
        );
      } catch (err: any) {
        if (err?.name === "AbortError") {
          Alert.alert("Temps dépassé", "Vérifie ta connexion et réessaye.");
        } else {
          Alert.alert("Erreur réseau", "Vérifie ta connexion internet.");
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
        abortRef.current = null;
      }
    },
    [remember, setError]
  );

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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
          <View className="flex-1 px-5 pt-10 pb-8">
            {/* Branding */}
            <View className="items-center mb-10">
              <Image
                source={assets.logo as any}
                alt="Tokana Logo"
                style={{ width: 48, height: 48 }}
              />
              <Text className="mt-4 text-2xl font-extrabold text-secondary">
                Tokana Delivery
              </Text>
              <Text className="text-accent mt-1">
                Livraison à vélo — rapide & assurée
              </Text>
            </View>

            {/* Form */}
            <View accessible accessibilityLabel="Formulaire de connexion">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    nativeID="email"
                    accessibilityLabel="Champ email"
                    inputMode="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="ex: rider@tokana.mg"
                    placeholderTextColor="#949789"
                    className="w-full rounded-xl border border-accent px-4 py-3 bg-white text-customblack"
                  />
                )}
              />
              <ErrorText message={errors.email?.message} />

              <View className="h-4" />

              <Label htmlFor="password">Mot de passe</Label>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="w-full rounded-2xl border border-accent flex-row items-center px-2 bg-white">
                    <TextInput
                      nativeID="password"
                      accessibilityLabel="Champ mot de passe"
                      secureTextEntry={secure}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Minimum 6 caractères"
                      placeholderTextColor="#949789"
                      className="flex-1 px-2 py-3 text-customblack"
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
                      className="px-3 py-2"
                    >
                      <Text className="text-accent">
                        {secure ? "👁️" : "🙈"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              />
              <ErrorText message={errors.password?.message} />

              {/* Remember + Forgot */}
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center">
                  <Switch
                    value={remember}
                    onValueChange={(v) => setRememberState(v)}
                    thumbColor={remember ? "#fcce2a" : undefined}
                    accessibilityLabel="Se souvenir de moi"
                  />
                  <Text className="ml-2 text-secondary">
                    Se souvenir de moi
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Mot de passe oublié",
                      "Implémente le flux de réinitialisation."
                    )
                  }
                  accessibilityRole="button"
                >
                  <Text className="text-secondary underline">
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="h-6" />

              <PrimaryButton
                onPress={handleSubmit(onSubmit)}
                disabled={!canSubmit}
                loading={loading}
                testID="login-submit"
                accessibilityLabel="Se connecter"
              >
                Se connecter
              </PrimaryButton>

              {loading && (
                <TouchableOpacity
                  onPress={cancelRequest}
                  className="mt-3 self-center"
                  accessibilityRole="button"
                  accessibilityLabel="Annuler la connexion"
                >
                  <Text className="text-accent">Annuler</Text>
                </TouchableOpacity>
              )}

              <View className="h-4" />

              {/* CTA secondaire (ex: SSO, inscription) */}
              <GhostButton
                onPress={() =>
                  Alert.alert(
                    "Inscription",
                    "Redirige vers l’écran d’inscription."
                  )
                }
                accessibilityLabel="Créer un compte"
              >
                Créer un compte
              </GhostButton>

              <View className="h-10" />

              {/* Footer/legal */}
              <View className="items-center">
                <Text className="text-accent text-center">
                  En vous connectant, vous acceptez nos{" "}
                  <Text className="underline">CGU</Text> &{" "}
                  <Text className="underline">
                    Politique de confidentialité
                  </Text>
                  .
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
