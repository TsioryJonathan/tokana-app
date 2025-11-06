import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useState as useStateAlias,
} from "react";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";
import { useToast } from "@/components/ui/Toast";
import { getApiClient } from "@/lib/api/client";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import VerifyPage from "@/components/Auth/VerifyPage";

import { TextInput } from "react-native";

export default function Verify() {
  const router = useRouter();
  const { showToast } = useToast();
  const api = useMemo(getApiClient, []);

  const [code, setCode] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [lastChannel, setLastChannel] = useState<"email" | null>(null);
  const [maskedTo, setMaskedTo] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expiresInSec, setExpiresInSec] = useState(0);
  const [expiredNotified, setExpiredNotified] = useState(false);
  const [canSendEmail, setCanSendEmail] = useState<boolean>(true);
  const codeInputRef = useRef<TextInput>(null);
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);

  const canSubmit = useMemo(
    () => /^\d{6}$/.test(code) && !loadingVerify && expiresInSec > 0,
    [code, loadingVerify, expiresInSec]
  );

  const maskEmail = (e: string) =>
    e.replace(/(^.).*(@.*$)/, (_m, a, b) => `${a}***${b}`);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api.me.getApiMe();
        if (!active) return;
        // Channel availability (only email now)
        const hasEmail = !!me?.email;
        setCanSendEmail(!!hasEmail);

        // Initialize last channel and masked destination if server has info
        const serverChannel = (me as any)?.accountOtpChannel as
          | "email"
          | undefined;
        if (serverChannel === "email" && hasEmail) {
          setLastChannel("email");
          setMaskedTo(maskEmail(String(me.email)));
        } else if (hasEmail) {
          setMaskedTo(maskEmail(String(me.email)));
        } else {
          setCanSendEmail(false);
        }

        // Initialize expiry countdown from server if provided
        const srvExp = (me as any)?.accountOtpExpiresAt as string | undefined;
        if (srvExp) {
          const ms = new Date(srvExp).getTime() - Date.now();
          if (ms > 0) setExpiresAt(srvExp);
          else setExpiresAt(null);
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [api]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setExpiresInSec(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;
    if (expiresInSec === 0) {
      setCode("");
      if (!expiredNotified) {
        showToast("OTP expiré, renvoyez un code.", "error");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {}
        );
        setExpiredNotified(true);
      }
    } else if (expiresInSec > 0 && expiredNotified) {
      setExpiredNotified(false);
    }
  }, [expiresInSec, expiresAt, expiredNotified, showToast]);

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const id = setInterval(() => {
      setEmailCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [emailCooldown]);

  const requestOtp = async () => {
    try {
      setLoadingEmail(true);
      const res = await api.auth.postApiAuthRequestOtp({ channel: "email" } as any);
      const dest = (res as any)?.to || "";
      setLastChannel("email");
      setMaskedTo(dest || maskedTo);
      const exp = (res as any)?.expiresAt as string | undefined;
      if (exp) {
        setExpiresAt(exp);
        setExpiredNotified(false);
      }
      // Bring attention to timer and field
      setScrollToTopSignal((v) => v + 1);
      requestAnimationFrame(() => codeInputRef.current?.focus());
      showToast(
        `OTP envoyé par email ${dest ? `à ${dest}` : ""}`.trim(),
        "success"
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Échec d'envoi OTP";
      const retry = Number(err?.body?.retryAfter || 0);
      if (err?.status === 429 && retry > 0) {
        setEmailCooldown(retry);
      }
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    } finally {
      setLoadingEmail(false);
    }
  };

  const onVerify = async () => {
    try {
      if (expiresInSec === 0) {
        showToast("CODE expiré, renvoyez un code.", "error");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {}
        );
        return;
      }
      setLoadingVerify(true);
      await api.auth.postApiAuthVerifyOtp({ code } as any);
      showToast("Compte vérifié", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      // Fetch role to route appropriately
      let role: string | undefined;
      try {
        const me = await (api as any).me.getApiMe();
        role = me?.role;
      } catch {}
      if (role === "admin") router.replace("/(admin)");
      else if (role === "livreur") router.replace("/(courier)");
      else router.replace("/(client)/home");
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "OTP invalide";
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <AuthScreenWrapper currentScreen="login">
      <VerifyPage
        code={code}
        setCode={setCode}
        canSubmit={canSubmit}
        loadingVerify={loadingVerify}
        onPressVerify={onVerify}
        loadingEmail={loadingEmail}
        onPressSendEmail={requestOtp}
        emailCooldown={emailCooldown}
        lastChannel={lastChannel}
        maskedTo={maskedTo}
        expiresInSec={expiresInSec}
        canSendEmail={canSendEmail}
        codeInputRef={codeInputRef}
        scrollToTopSignal={scrollToTopSignal}
        showExpiryWarning={!!expiresAt && expiresInSec === 0}
      />
    </AuthScreenWrapper>
  );
}
