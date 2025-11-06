import Constants from "expo-constants";
import { TokanaApiClient } from "@/lib/api";
import { FetchHttpRequest } from "@/lib/api/core/FetchHttpRequest";
import type { OpenAPIConfig } from "@/lib/api/core/OpenAPI";
import type { ApiRequestOptions } from "@/lib/api/core/ApiRequestOptions";
import type { CancelablePromise } from "@/lib/api/core/CancelablePromise";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "@/lib/auth/session";

let cached: TokanaApiClient | null = null;
let currentBase: string | null = null;

export function getApiBase(): string | null {
  return currentBase;
}

export function getApiClient(): TokanaApiClient {
  if (cached) return cached;
  const extra = (Constants as any)?.expoConfig?.extra || {};

  let base: string | undefined;
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
  if (envBase && envBase.trim().length > 0) {
    base = envBase.trim();
  } else {
    // Always use production API from app.json (Render)
    base = extra.API_BASE_PROD || "https://tokana-app.onrender.com";
    if (__DEV__) {
      console.log("[TokanaApi] BASE (using production API):", base);
    }
  }
  currentBase = base!;
  // Custom HttpRequest to handle 401 globally
  class HttpRequestWith401 extends FetchHttpRequest {
    public override request<T>(
      options: ApiRequestOptions
    ): CancelablePromise<T> {
      const p = super.request<T>(options) as unknown as Promise<T>;
      const handled = p.catch(async (err: unknown) => {
        const status = (err as any)?.status;
        const body = (err as any)?.body;
        if (status === 401) {
          // Prevent infinite retry loops: if we've already retried, fall back to logout
          const alreadyRetried = (options.headers as any)?.["x-retry"] === "1";
          if (alreadyRetried) {
            try {
              await clearSession();
              try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { router } = require("expo-router");
                router.replace("/(auth)/login" as any);
              } catch {}
            } catch {}
            throw err;
          }
          // Try refresh token flow once
          try {
            const rt = await getRefreshToken();
            if (!rt) throw new Error("no refresh token");
            // Use a plain request client (no 401 wrapping) to avoid recursion
            const plainClient = new TokanaApiClient({ BASE: base! }, FetchHttpRequest as any);
            const tokens = await plainClient.auth.postApiAuthRefresh({ refreshToken: rt });
            if (!tokens?.token || !tokens?.refreshToken) throw new Error("invalid refresh response");
            await setSession({ token: tokens.token, refreshToken: tokens.refreshToken });
            // Retry original request with a single-use retry header
            const retryOptions: ApiRequestOptions = {
              ...options,
              headers: { ...(options.headers || {}), "x-retry": "1" },
            };
            return (await super.request<T>(retryOptions)) as unknown as T;
          } catch (e) {
            // Refresh failed: clear session and redirect to login
            try { await clearSession(); } catch {}
            try {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { router } = require("expo-router");
              router.replace("/(auth)/login" as any);
            } catch {}
            throw err;
          }
        } else if (status === 403) {
          // If backend requires verified email, redirect user to verification flow
          const msg: string | undefined = typeof body?.msg === 'string' ? body.msg : undefined;
          if (msg && (/email non vérifié/i.test(msg) || /téléphone non vérifié/i.test(msg))) {
            // Normaliser le message d'erreur pour toujours afficher "Email non vérifié"
            // même si le serveur envoie encore "Téléphone non vérifié" (ancien code)
            const normalizedMsg = msg.replace(/téléphone non vérifié/i, 'Email non vérifié');
            // Mettre à jour le message dans l'erreur pour que le client l'affiche correctement
            if (typeof body === 'object' && body !== null) {
              (body as any).msg = normalizedMsg;
            }
            try {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { router } = require("expo-router");
              router.push("/(auth)/verify" as any);
            } catch {}
          }
        }
        throw err;
      });
      return handled as unknown as CancelablePromise<T>;
    }
  }


  cached = new TokanaApiClient(
    {
      BASE: base!,
      TOKEN: async () => (await getAccessToken()) ?? "",
    },
    HttpRequestWith401 as any
  );
  return cached;
}
