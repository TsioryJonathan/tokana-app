import React, { useMemo, useState } from "react";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";
import LoginPage from "@/components/Auth/LoginPage";
import { getApiClient } from "@/lib/api/client";
import { useRouter } from "expo-router";
import { setSession } from "@/lib/auth/session";
import { useToast } from "@/components/ui/Toast";
import * as Haptics from "expo-haptics";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const { showToast } = useToast();

  const canSubmit = useMemo(
    () => email.length > 0 && password.length >= 6 && !loading,
    [email, password, loading]
  );

  const api = useMemo(getApiClient, []);
  const onSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.auth.postApiAuthLogin({
        email: email.trim(),
        password: password.trim(),
      });
      await setSession({
        token: res.token,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      showToast("Connexion réussie", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      if (res.user?.role === "admin") router.replace("/(admin)");
      else router.replace("/(client)/home");
    } catch (err: any) {
      const msg: string =
        err?.body?.msg || err?.message || "Erreur de connexion";
      setErrorMessage(msg);
      console.warn("login error", err?.body || err?.message || err);
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthScreenWrapper currentScreen="login">
      <LoginPage
        canSubmit={canSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
        onPressLogin={onSubmit}
        onPressForgot={() => router.replace("/(auth)/forgot")}
      />
    </AuthScreenWrapper>
  );
};

export default Login;
