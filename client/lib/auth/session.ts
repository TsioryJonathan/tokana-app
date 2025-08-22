import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY_ACCESS = 'tokana_access_token';
const KEY_REFRESH = 'tokana_refresh_token';
const KEY_USER = 'tokana_user_json';

export type SessionData = {
  token?: string; // access
  refreshToken?: string;
  user?: any;
};

type StorageLike = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  deleteItem: (key: string) => Promise<void>;
};

let storageImpl: StorageLike | null = null;

async function getStorage(): Promise<StorageLike> {
  if (storageImpl) return storageImpl;
  try {
    const available = await SecureStore.isAvailableAsync();
    if (available && SecureStore.setItemAsync && SecureStore.getItemAsync && SecureStore.deleteItemAsync) {
      storageImpl = {
        setItem: (k, v) => SecureStore.setItemAsync(k, v),
        getItem: (k) => SecureStore.getItemAsync(k),
        deleteItem: (k) => SecureStore.deleteItemAsync(k),
      };
      return storageImpl;
    }
  } catch {}
  // Fallbacks
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    storageImpl = {
      setItem: async (k, v) => {
        window.localStorage.setItem(k, v);
      },
      getItem: async (k) => window.localStorage.getItem(k),
      deleteItem: async (k) => {
        window.localStorage.removeItem(k);
      },
    };
    return storageImpl;
  }
  // Last resort: in-memory (session-only)
  const mem = new Map<string, string>();
  storageImpl = {
    setItem: async (k, v) => {
      mem.set(k, v);
    },
    getItem: async (k) => mem.get(k) ?? null,
    deleteItem: async (k) => {
      mem.delete(k);
    },
  };
  return storageImpl;
}

export async function setSession(data: SessionData) {
  const store = await getStorage();
  if (data.token) await store.setItem(KEY_ACCESS, data.token);
  if (data.refreshToken) await store.setItem(KEY_REFRESH, data.refreshToken);
  if (data.user) await store.setItem(KEY_USER, JSON.stringify(data.user));
}

export async function getAccessToken(): Promise<string | undefined> {
  try {
    const store = await getStorage();
    return (await store.getItem(KEY_ACCESS)) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getRefreshToken(): Promise<string | undefined> {
  try {
    const store = await getStorage();
    return (await store.getItem(KEY_REFRESH)) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function getUser<T = any>(): Promise<T | undefined> {
  try {
    const store = await getStorage();
    const raw = await store.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export async function clearSession() {
  const store = await getStorage();
  await store.deleteItem(KEY_ACCESS);
  await store.deleteItem(KEY_REFRESH);
  await store.deleteItem(KEY_USER);
}
