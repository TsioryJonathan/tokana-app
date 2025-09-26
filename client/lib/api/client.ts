import Constants from "expo-constants";
import { Platform } from "react-native";
import { TokanaApiClient } from "@/lib/api";
import { FetchHttpRequest } from "@/lib/api/core/FetchHttpRequest";
import type { OpenAPIConfig } from "@/lib/api/core/OpenAPI";
import type { ApiRequestOptions } from "@/lib/api/core/ApiRequestOptions";
import type { CancelablePromise } from "@/lib/api/core/CancelablePromise";
import { clearSession, getAccessToken } from "@/lib/auth/session";

let cached: TokanaApiClient | null = null;
let currentBase: string | null = null;

export function getApiBase(): string | null {
  return currentBase;
}

export function getApiClient(): TokanaApiClient {
  if (cached) return cached;
  const extra = (Constants as any)?.expoConfig?.extra || {};

  let base: string | undefined;
  if (__DEV__) {
    base = extra.API_BASE_DEV;
    const hostUri = (Constants as any)?.expoConfig?.hostUri as
      | string
      | undefined;
    const host = hostUri ? hostUri.split(":")[0] : undefined;

    const nativeFallback = host
      ? `http://${host}:5000`
      : "http://localhost:5000";
    if (!base) {
      base = Platform.select({
        web: "http://localhost:5000",
        default: nativeFallback,
      }) as string;
    } else if (
      Platform.OS !== "web" &&
      /(^|\/)localhost(?=[:/]|$)/.test(base)
    ) {
      base = nativeFallback;
    }
    // Debug log in development

    console.log("[TokanaApi] BASE (dev):", base, "| hostUri:", hostUri);
  } else {
    base = extra.API_BASE_PROD || "https://tokana-app.onrender.com";
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
        if (status === 401) {
          try {
            await clearSession();
            // Lazy import to avoid cyclic deps in non-Expo environments
            try {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { router } = require("expo-router");
              router.replace("/" as any);
            } catch {}
          } catch {}
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
