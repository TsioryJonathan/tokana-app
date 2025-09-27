import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { getAccessToken } from "@/lib/auth/session";
import { getApiClient } from "@/lib/api/client";

export type UseAuthGuardOptions = {
  requireAuth?: boolean; // default true
  allowedRoles?: ("client" | "livreur" | "admin")[]; // optional
};

export function useAuthGuard(
  options: UseAuthGuardOptions = { requireAuth: true }
) {
  const { requireAuth = true, allowedRoles } = options;
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
        if (token && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
          try {
            const profile = await api.me.getApiMe();
            if (!mounted) return;
            setMe(profile);
            if (!allowedRoles.includes(profile.role as any)) {
              router.replace("/" as any);
              return;
            }
          } catch {
            if (!mounted) return;
            router.replace("/" as any);
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
    Array.isArray(allowedRoles) ? allowedRoles.join("|") : "",
  ]);

  return { checking, me } as const;
}
