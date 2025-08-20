import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
// safe area handled by layout
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { assets } from "@/assets/images/assets";
import { TokanaApiClient } from "@/app/lib/api";
import { getAccessToken, setSession } from "@/app/lib/auth/session";
import { router } from "expo-router";
import Constants from "expo-constants";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  onPressRegister?: () => void; // callback externe optionnel
  onPressForgot?: () => void; // callback externe optionnel
  q?: string;
};

export default function AuthScreen({
  onPressRegister,
  onPressForgot,
  q,
}: Props) {
  // insets handled by route-group layout
  // Onglet actif
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    q === "register" ? "signup" : "login"
  );

  // ----- States Login -----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // ----- States Register -----
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ----- API client -----
  const api = useMemo(() => {
    const extra = (Constants as any)?.expoConfig?.extra || {};
    let base: string | undefined;
    if (__DEV__) {
      // Prefer configured dev base, else fallback to expo host IP
      base = extra.API_BASE_DEV;
      if (!base) {
        const hostUri = (Constants as any)?.expoConfig?.hostUri as string | undefined;
        const host = hostUri ? hostUri.split(":")[0] : undefined;
        base = Platform.select({ web: "http://localhost:5000", default: host ? `http://${host}:5000` : "http://localhost:5000" });
      }
    } else {
      base = extra.API_BASE_PROD || "https://api.example.com";
    }
    return new TokanaApiClient({
      BASE: base!,
      TOKEN: async () => (await getAccessToken()) ?? '',
    });
  }, []);

  // ----- Validation helpers -----
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  // Align with backend validator: /^(\+261|0)(3[0-9]|20)\d{7}$/
  const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;

  // Soumission possible (login)
  const canSubmitLogin = useMemo(
    () => email.trim().length > 0 && password.trim().length >= 6 && !loading,
    [email, password, loading]
  );

  // Soumission possible (register)
  const canSubmitRegister = useMemo(() => {
    const okEmail = emailRegex.test(email.trim());
    const okPwd = password.length >= 6 && confirm === password;
    const okName = fullName.trim().length > 0;
    const okTerms = acceptTerms;
    return okEmail && okPwd && okName && okTerms && !loading;
  }, [emailRegex, email, password, confirm, fullName, acceptTerms, loading]);

  // ----- Handlers -----
  const onPressLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.auth.postApiAuthLogin({ email: email.trim(), password });
      await setSession({ token: res.token, refreshToken: res.refreshToken, user: res.user });
      console.log("login ok", res.user);
      if (res.user?.role === 'admin') router.replace('/admin');
      else if (res.user?.role === 'livreur') router.replace('/delivery');
      else router.replace('/home');
    } catch (err: any) {
      console.warn("login error", err?.body || err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    // validation côté parent (les messages s’affichent dans RegisterForm)
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Nom complet requis";
    if (!emailRegex.test(email.trim())) e.email = "Email invalide";
    if (phone.trim() && !mgPhoneRegex.test(phone.trim()))
      e.phone = "Numéro MG invalide";
    if (password.length < 6) e.password = "≥ 6 caractères";
    if (confirm !== password) e.confirm = "Mots de passe différents";
    if (!acceptTerms) e.accept = "Veuillez accepter les CGU";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const res = await api.auth.postApiAuthRegister({
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        name: fullName.trim(),
      });
      await setSession({ token: res.token, refreshToken: res.refreshToken, user: res.user });
      // Redirige selon le rôle (normalement client)
      if (res.user?.role === 'admin') router.replace('/admin');
      else if (res.user?.role === 'livreur') router.replace('/delivery');
      else router.replace('/home');
    } catch (err: any) {
      // Map minimal errors to existing error slots without changing UI
      const msg: string = err?.body?.msg || err?.message || "Erreur d’inscription";
      const newErrs: Record<string, string> = {};
      if (/email/i.test(msg)) newErrs.email = msg;
      if (/téléphone|phone/i.test(msg)) newErrs.phone = msg;
      if (/mot de passe|password/i.test(msg)) newErrs.password = msg;
      if (Object.keys(newErrs).length === 0) newErrs.email = msg; // fallback
      setErrors(newErrs);
      console.warn("register error", err?.body || err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre onglets (et callbacks externes facultatifs)
  const goToRegister = () => {
    setActiveTab("signup");
    onPressRegister?.();
  };
  const goToLogin = () => setActiveTab("login");

  return (
    <View className="flex-1 bg-black">

      <ImageBackground
        source={assets.tana as any}
        resizeMode="center"
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.65)"]}
          style={{ position: "absolute", inset: 0 }}
        />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={{ paddingBottom: 12 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
          <View className="flex-col justify-between min-h-full">
            {/* HEADER (titre centré) */}
            <View className="flex flex-col justify-around items-center mt-2 h-[20%]">
              <Image
                source={assets.logo as any}
                style={{ width: 90, height: 80 }}
                resizeMode="contain"
              />
            </View>

            {/* CARTE GLASSMORPHISM */}
            <BlurView
              intensity={50}
              tint="light"
              style={{ borderRadius: 20, overflow: "hidden" }}
              className="w-full"
            >
              <View className="p-4 bg-white/15">
                {/* Onglets Login / Sign Up (pill) */}
                <View className="w-full h-10 bg-white/30 rounded-full p-1 flex-row">
                  <TouchableOpacity
                    className={`flex-1 items-center justify-center rounded-full ${
                      activeTab === "login" ? "bg-white" : ""
                    }`}
                    onPress={goToLogin}
                  >
                    <Text
                      className={`font-quicksand-semibold ${
                        activeTab === "login" ? "text-black" : "text-white"
                      }`}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 items-center justify-center rounded-full ${
                      activeTab === "signup" ? "bg-white" : ""
                    }`}
                    onPress={goToRegister}
                  >
                    <Text
                      className={`font-quicksand-semibold ${
                        activeTab === "signup" ? "text-black" : "text-white"
                      }`}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === "login" ? (
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    secure={secure}
                    setSecure={setSecure}
                    remember={remember}
                    setRemember={setRemember}
                    loading={loading}
                    canSubmit={canSubmitLogin}
                    onPressLogin={onPressLogin}
                    onPressForgot={onPressForgot ?? (() => {})}
                    onPressRegister={goToRegister}
                  />
                ) : (
                  <RegisterForm
                    // values
                    fullName={fullName}
                    email={email}
                    phone={phone}
                    password={password}
                    confirm={confirm}
                    // setters
                    setFullName={setFullName}
                    setEmail={setEmail}
                    setPhone={setPhone}
                    setPassword={setPassword}
                    setConfirm={setConfirm}
                    // visibility
                    secure={secure}
                    setSecure={setSecure}
                    secureConfirm={secureConfirm}
                    setSecureConfirm={setSecureConfirm}
                    // terms
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    // ui state
                    loading={loading}
                    canSubmit={canSubmitRegister}
                    errors={errors}
                    // handlers
                    onSubmit={handleRegister}
                    onGoToLogin={goToLogin}
                  />
                )}
              </View>
            </BlurView>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}
