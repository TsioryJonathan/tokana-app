/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const { showToast } = useToast();

  const canSubmit = useMemo(
    () => identifier.length > 0 && password.length >= 6 && !loading,
    [identifier, password, loading]
  );

  const api = useMemo(getApiClient, []);

  const onSubmit = async () => {
    try {
      setLoading(true);
      // Accept MG phone even if user types spaces/dashes/parentheses
      const raw = identifier.trim();
      const cleaned = raw.replace(/[\s.\-()]/g, "");
      const isMgPhone = (() => {
        // +261XXXXXXXXX or 261XXXXXXXXX or 0(3x|20)XXXXXXX
        if (/^\+?261\d{9}$/.test(cleaned)) return true;
        if (/^0(3\d|20)\d{7}$/.test(cleaned)) return true;
        return false;
      })();
      const phoneForPayload = (() => {
        if (/^0(3\d|20)\d{7}$/.test(cleaned)) return cleaned; // server will normalize
        if (/^261\d{9}$/.test(cleaned)) return `+${cleaned}`;
        if (/^\+261\d{9}$/.test(cleaned)) return cleaned;
        return raw; // fallback
      })();
      const payload = isMgPhone
        ? { phone: phoneForPayload, password: password.trim() }
        : { email: raw, password: password.trim() };
      const res = await api.auth.postApiAuthLogin(payload as any);
      await setSession({
        token: res.token,
        refreshToken: res.refreshToken,
        user: res.user,
      });
      showToast("Connexion réussie", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      if (res.user?.role === "admin") {
        router.replace("/(admin)");
      } else if (res.user?.role === "livreur") {
        router.replace("/(courier)");
      } else if (res.user?.role === "client") {
        router.replace("/(client)/home");
      } else {
        router.replace("/");
      }
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
        // Re-use the same input for email or phone
        email={identifier}
        setEmail={setIdentifier}
        password={password}
        setPassword={setPassword}
        loading={loading}
        onPressLogin={onSubmit}
        onPressForgot={() => router.replace("/(auth)/forgot")}
        onPressSignUp={() => router.push("/(auth)/register")}
      />
    </AuthScreenWrapper>
  );
};

export default Login;
