import Constants from "expo-constants";
import { Platform } from "react-native";
import { TokanaApiClient } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";

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
    const hostUri = (Constants as any)?.expoConfig?.hostUri as string | undefined;
    const host = hostUri ? hostUri.split(":")[0] : undefined;
    const nativeFallback = host ? `http://${host}:5000` : "http://localhost:5000";
    if (!base) {
      base = Platform.select({ web: "http://localhost:5000", default: nativeFallback }) as string;
    } else if (Platform.OS !== 'web' && /(^|\/)localhost(?=[:/]|$)/.test(base)) {
      base = nativeFallback;
    }
    // Debug log in development
    // eslint-disable-next-line no-console
    console.log('[TokanaApi] BASE (dev):', base, '| hostUri:', hostUri);
  } else {
    base = extra.API_BASE_PROD || "https://api.example.com";
  }
  currentBase = base!;
  cached = new TokanaApiClient({
    BASE: base!,
    TOKEN: async () => (await getAccessToken()) ?? "",
  });
  return cached;
}
