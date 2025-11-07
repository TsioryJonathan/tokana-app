import Constants from "expo-constants";
import { TokanaApiClient } from "./";
import { FetchHttpRequest } from "./core/FetchHttpRequest";
import type { OpenAPIConfig } from "./core/OpenAPI";
import type { ApiRequestOptions } from "./core/ApiRequestOptions";
import type { CancelablePromise } from "./core/CancelablePromise";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "../auth/session";

let cached: TokanaApiClient | null = null;
let currentBase: string | null = null;

export function getApiBase(): string | null {
  return currentBase;
}

export function resetApiClient(): void {
  cached = null;
  currentBase = null;
}

export function getApiClient(): TokanaApiClient {
  if (cached) return cached;
  const extra = (Constants as any)?.expoConfig?.extra || {};

  // Diagnostic: afficher toutes les valeurs pour comprendre le problème
  const useLocalApi = process.env.EXPO_PUBLIC_USE_LOCAL_API === "true";
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
  const apiBaseProd = extra.API_BASE_PROD;
  const apiBaseDev = extra.API_BASE_DEV;
  
  console.log("[TokanaApi] 🔍 Diagnostic de configuration:");
  console.log("  - EXPO_PUBLIC_USE_LOCAL_API:", useLocalApi);
  console.log("  - EXPO_PUBLIC_API_BASE_URL:", envBase);
  console.log("  - extra.API_BASE_PROD:", apiBaseProd);
  console.log("  - extra.API_BASE_DEV:", apiBaseDev);
  console.log("  - Constants.expoConfig.extra:", JSON.stringify(extra, null, 2));

  let base: string | undefined;
  
  // Par défaut: toujours utiliser l'API de production (Render)
  // Pour utiliser l'API locale, définissez EXPO_PUBLIC_USE_LOCAL_API=true ET EXPO_PUBLIC_API_BASE_URL
  if (useLocalApi && envBase && envBase.trim().length > 0) {
    // Mode développement avec API locale explicite (uniquement si EXPO_PUBLIC_USE_LOCAL_API=true)
    base = envBase.trim();
    console.log("[TokanaApi] ⚠️ MODE DÉVELOPPEMENT - Utilisation de l'API LOCALE:", base);
  } else {
    // FORCER l'utilisation de l'API Render, ignorer toute URL locale
    const RENDER_API_URL = "https://tokana-app.onrender.com";
    
    // Vérifier si API_BASE_PROD est une URL Render valide
    if (apiBaseProd && 
        (apiBaseProd.includes("tokana-app.onrender.com") || 
         apiBaseProd.includes("onrender.com") ||
         apiBaseProd.startsWith("https://"))) {
      // Utiliser API_BASE_PROD seulement s'il pointe vers Render ou une URL HTTPS valide
      base = apiBaseProd;
      console.log("[TokanaApi] ✅ Utilisation de API_BASE_PROD (Render):", base);
    } else {
      // Forcer l'URL Render si API_BASE_PROD est locale ou invalide
      base = RENDER_API_URL;
      if (apiBaseProd) {
        console.log("[TokanaApi] ⚠️ API_BASE_PROD contient une URL locale/invalide:", apiBaseProd);
        console.log("[TokanaApi] 🔧 Forçage de l'URL Render:", base);
      } else {
        console.log("[TokanaApi] ✅ Utilisation de l'API PRODUCTION (Render):", base);
      }
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
