import React, { useEffect, useMemo, useState } from "react";
import AuthScreenWrapper from "@/components/Auth/AuthScreenWrapper";
import { useToast } from "@/components/ui/Toast";
import { getApiClient } from "@/lib/api/client";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import VerifyPage from "@/components/Auth/VerifyPage";
import { useRef, useState as useStateAlias } from "react";
import { TextInput } from "react-native";

export default function Verify() {
  const router = useRouter();
  const { showToast } = useToast();
  const api = useMemo(getApiClient, []);

  const [code, setCode] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [smsCooldown, setSmsCooldown] = useState(0);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [lastChannel, setLastChannel] = useState<'sms' | 'email' | null>(null);
  const [maskedTo, setMaskedTo] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expiresInSec, setExpiresInSec] = useState(0);
  const [expiredNotified, setExpiredNotified] = useState(false);
  const [canSendSms, setCanSendSms] = useState<boolean>(true);
  const [canSendEmail, setCanSendEmail] = useState<boolean>(true);
  const codeInputRef = useRef<TextInput>(null);
  const [scrollToTopSignal, setScrollToTopSignal] = useState(0);

  const canSubmit = useMemo(
    () => /^\d{6}$/.test(code) && !loadingVerify && expiresInSec > 0,
    [code, loadingVerify, expiresInSec]
  );

  const maskPhone = (p: string) => p.replace(/(\+?\d{2,3})(\d+)(\d{2})$/, (_m, a, mid, b) => `${a}${"*".repeat(Math.max(0, mid.length))}${b}`);
  const maskEmail = (e: string) => e.replace(/(^.).*(@.*$)/, (_m, a, b) => `${a}***${b}`);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api.me.getApiMe();
        if (!active) return;
        // Channel availability
        const hasPhone = !!me?.phone;
        const hasEmail = !!me?.email;
        setCanSendSms(!!hasPhone);
        setCanSendEmail(!!hasEmail);

        // Initialize last channel and masked destination if server has info
        const serverChannel = (me as any)?.accountOtpChannel as 'sms' | 'email' | undefined;
        if (serverChannel === 'sms' && hasPhone) {
          setLastChannel('sms');
          setMaskedTo(maskPhone(String(me.phone)));
        } else if (serverChannel === 'email' && hasEmail) {
          setLastChannel('email');
          setMaskedTo(maskEmail(String(me.email)));
        } else if (hasPhone) {
          setMaskedTo(maskPhone(String(me.phone)));
        } else if (hasEmail) {
          setMaskedTo(maskEmail(String(me.email)));
        } else {
          setCanSendSms(false);
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
    return () => { active = false; };
  }, [api]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setExpiredNotified(true);
      }
    } else if (expiresInSec > 0 && expiredNotified) {
      setExpiredNotified(false);
    }
  }, [expiresInSec, expiresAt, expiredNotified, showToast]);

  useEffect(() => {
    if (smsCooldown <= 0 && emailCooldown <= 0) return;
    const id = setInterval(() => {
      setSmsCooldown((v) => (v > 0 ? v - 1 : 0));
      setEmailCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [smsCooldown, emailCooldown]);

  const requestOtp = async (channel: "sms" | "email") => {
    try {
      channel === "sms" ? setLoadingSms(true) : setLoadingEmail(true);
      const res = await api.auth.postApiAuthRequestOtp({ channel } as any);
      const dest = (res as any)?.to || "";
      setLastChannel(channel);
      setMaskedTo(dest || maskedTo);
      const exp = (res as any)?.expiresAt as string | undefined;
      if (exp) {
        setExpiresAt(exp);
        setExpiredNotified(false);
      }
      // Bring attention to timer and field
      setScrollToTopSignal((v) => v + 1);
      requestAnimationFrame(() => codeInputRef.current?.focus());
      showToast(`OTP envoyé via ${channel.toUpperCase()} ${dest ? `à ${dest}` : ""}`.trim(), "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Échec d'envoi OTP";
      const retry = Number(err?.body?.retryAfter || 0);
      if (err?.status === 429 && retry > 0) {
        if (channel === 'sms') setSmsCooldown(retry);
        else setEmailCooldown(retry);
      }
      showToast(msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setLoadingSms(false);
      setLoadingEmail(false);
    }
  };

  const onVerify = async () => {
    try {
      if (expiresInSec === 0) {
        showToast("CODE expiré, renvoyez un code.", "error");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return;
      }
      setLoadingVerify(true);
      await api.auth.postApiAuthVerifyOtp({ code } as any);
      showToast("Compte vérifié", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
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
        loadingSms={loadingSms}
        onPressSendSms={() => requestOtp('sms')}
        loadingEmail={loadingEmail}
        onPressSendEmail={() => requestOtp('email')}
        smsCooldown={smsCooldown}
        emailCooldown={emailCooldown}
        lastChannel={lastChannel}
        maskedTo={maskedTo}
        expiresInSec={expiresInSec}
        canSendSms={canSendSms}
        canSendEmail={canSendEmail}
        codeInputRef={codeInputRef}
        scrollToTopSignal={scrollToTopSignal}
        showExpiryWarning={!!expiresAt && expiresInSec === 0}
      />
    </AuthScreenWrapper>
  );
}
