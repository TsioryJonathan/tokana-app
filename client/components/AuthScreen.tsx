import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { assets } from "@/assets/images/assets";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type Props = {
  onPressRegister?: () => void; // callback externe optionnel
  onPressForgot?: () => void; // callback externe optionnel
};

export default function AuthScreen({ onPressRegister, onPressForgot }: Props) {
  // Onglet actif
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

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

  // ----- Validation helpers -----
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const mgPhoneRegex = /^(\+261|0)\d{8,9}$/;

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
  const onPressLogin = () => {
    if (loading) return;
    setLoading(true);
    // TODO: call your API here
    setTimeout(() => setLoading(false), 1200);
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
      // TODO: call your API here
      await new Promise((r) => setTimeout(r, 900));
      // Après succès : repasser sur l’onglet login
      setActiveTab("login");
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
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

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
        >
          <View className="px-5 py-3 flex-col justify-between h-full">
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
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
