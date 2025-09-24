import React, { useMemo, useState } from "react";
import RegisterPage from "@/components/Auth/RegisterPage";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";
import { getApiClient } from "@/lib/api/client";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { setSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";

const Register = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const { showToast } = useToast();

  const onSubmit = async () => {
    try {
      const res = await api.auth.postApiAuthRegister({
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        name: fullName.trim(),
      });
      await setSession({
        token: res.token,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      showToast("Inscription réussie", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      if (res.user?.role === "admin") router.replace("/(admin)");
      else router.replace("/(client)/home");
    } catch (err: any) {
      const msg: string =
        err?.body?.msg || err?.message || "Erreur d’inscription";
      const newErrs: Record<string, string> = {};
      if (/email/i.test(msg)) newErrs.email = msg;
      if (/téléphone|phone/i.test(msg)) newErrs.phone = msg;
      if (/mot de passe|password/i.test(msg)) newErrs.password = msg;
      if (Object.keys(newErrs).length === 0) newErrs.email = msg; // fallback
      console.warn("register error", err?.body || err?.message || err);
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    } finally {
    }
  };

  const registerProps = useMemo(
    () => ({
      fullName,
      setFullName,
      email,
      setEmail,
      phone,
      setPhone,
      password,
      setPassword,
      confirm,
      setConfirm,
    }),
    [confirm, email, fullName, password, phone]
  );
  return (
    <AuthScreenWrapper currentScreen="register">
      <RegisterPage {...registerProps} onSubmit={onSubmit} />
    </AuthScreenWrapper>
  );
};

export default Register;
