import * as SecureStore from 'expo-secure-store';

const KEY_ACCESS = 'tokana_access_token';
const KEY_REFRESH = 'tokana_refresh_token';
const KEY_USER = 'tokana_user_json';

export type SessionData = {
  token?: string; // access
  refreshToken?: string;
  user?: any;
};

export async function setSession(data: SessionData) {
  if (data.token) await SecureStore.setItemAsync(KEY_ACCESS, data.token);
  if (data.refreshToken) await SecureStore.setItemAsync(KEY_REFRESH, data.refreshToken);
  if (data.user) await SecureStore.setItemAsync(KEY_USER, JSON.stringify(data.user));
}

export async function getAccessToken(): Promise<string | undefined> {
  try {
    return await SecureStore.getItemAsync(KEY_ACCESS) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getRefreshToken(): Promise<string | undefined> {
  try {
    return await SecureStore.getItemAsync(KEY_REFRESH) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getUser<T = any>(): Promise<T | undefined> {
  try {
    const raw = await SecureStore.getItemAsync(KEY_USER);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY_ACCESS);
  await SecureStore.deleteItemAsync(KEY_REFRESH);
  await SecureStore.deleteItemAsync(KEY_USER);
}
