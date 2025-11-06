import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { getAccessToken, clearSession } from "@/lib/auth/session";
import { getApiClient } from "@/lib/api/client";

export type UseAuthGuardOptions = {
  requireAuth?: boolean; // default true
  allowedRoles?: ("client" | "livreur" | "admin")[]; // optional
  requireVerifiedEmail?: boolean; // when true, redirect unverified users to /(auth)/verify
  requireVerifiedPhone?: boolean; // when true, redirect unverified users to /(auth)/verify (deprecated, use requireVerifiedEmail)
};

export function useAuthGuard(
  options: UseAuthGuardOptions = { requireAuth: true }
) {
  const { requireAuth = true, allowedRoles, requireVerifiedEmail = false, requireVerifiedPhone = false } = options;
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (requireAuth && !token) {
          if (!mounted) return;
          router.replace("/(auth)/login" as any);
          return;
        }
        if (token && (Array.isArray(allowedRoles) && allowedRoles.length > 0 || requireVerifiedEmail || requireVerifiedPhone)) {
          try {
            const profile = await api.me.getApiMe();
            if (!mounted) return;
            setMe(profile);
            if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(profile.role as any)) {
              router.replace("/" as any);
              return;
            }
            // Vérifier l'email si requireVerifiedEmail est activé
            if (requireVerifiedEmail && !profile.emailVerifiedAt) {
              router.replace("/(auth)/verify" as any);
              return;
            }
            // Vérifier le téléphone si requireVerifiedPhone est activé (pour compatibilité)
            if (requireVerifiedPhone && profile.role === 'client' && !profile.phoneVerifiedAt) {
              router.replace("/(auth)/verify" as any);
              return;
            }
          } catch {
            if (!mounted) return;
            // If fetching /api/me fails (likely 401), clear session and redirect to login
            try { await clearSession(); } catch {}
            router.replace("/(auth)/login" as any);
            return;
          }
        }
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    api,
    router,
    requireAuth,
    requireVerifiedEmail,
    requireVerifiedPhone,
    Array.isArray(allowedRoles) ? allowedRoles.join("|") : "",
  ]);

  return { checking, me } as const;
}
