import React, { useMemo, useState } from "react";
import RegisterPage from "../../components/Auth/RegisterPage";
import AuthScreenWrapper from "../../components/Auth/AuthScreenWrapper";
import { getApiClient } from "../../lib/api/client";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { setSession } from "../../lib/auth/session";
import { useToast } from "../../components/ui/Toast";

const Register = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const { showToast } = useToast();

  const onSubmit = async () => {
    try {
      setLoading(true);
      const emailTrim = email.trim();
      const phoneTrim = phone.trim();
      const nameTrim = fullName.trim();
      const res = await api.auth.postApiAuthRegister({
        email: emailTrim || undefined,
        phone: phoneTrim || undefined,
        password: password,
        name: nameTrim,
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
      if (res.user?.role === "admin") {
        router.replace("/(admin)");
      } else {
        // Guide the user to verification flow right after signup
        router.replace("/(auth)/verify" as any);
      }
    } catch (err: any) {

      const msg: string =
        err?.body?.msg || err?.message || "Erreur d'inscription";
      const newErrs: Record<string, string> = {};
      if (/email/i.test(msg)) newErrs.email = msg;
      if (/téléphone|phone/i.test(msg)) newErrs.phone = msg;
      if (/mot de passe|password/i.test(msg)) newErrs.password = msg;
      if (Object.keys(newErrs).length === 0) newErrs.email = msg; // fallback
      
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    } finally {
      setLoading(false);
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
      loading,
    }),
    [confirm, email, fullName, password, phone, loading]
  );
  return (
    <AuthScreenWrapper currentScreen="register">
      <RegisterPage {...registerProps} onSubmit={onSubmit} />
    </AuthScreenWrapper>
  );
};

export default Register;
