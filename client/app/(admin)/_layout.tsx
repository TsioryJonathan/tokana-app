import React, { useEffect, useMemo, useState } from 'react';
import { Link, Stack, usePathname, useRouter, type Href } from 'expo-router';
import { View, Text, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiBase, getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth/session';

export default function AdminLayout() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [meName, setMeName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Early check: no token => ask login
        const token = await getAccessToken();
        if (!token) {
          if (!mounted) return;
          showToast('Veuillez vous reconnecter', 'error');
          router.replace('/');
          return;
        }
        // Debug: log base + token presence
        const base = getApiBase();
        // eslint-disable-next-line no-console
        console.log('[AdminLayout] calling /api/me on', base, '| token length:', token?.length ?? 0);
        const me = await api.me.getApiMe();
        if (!mounted) return;
        setMeName(me.name || null);
        if (me.role !== 'admin') {
          showToast('Accès réservé aux administrateurs', 'error');
          router.replace('/');
          return;
        }
      } catch (e) {
        if (!mounted) return;
        // Provide precise feedback
        let status: number | undefined;
        try {
          if (e instanceof ApiError) {
            status = e.status;
          } else if (e && typeof e === 'object' && 'status' in (e as any)) {
            status = (e as any).status as number;
          }
        } catch {}
        // eslint-disable-next-line no-console
        console.error('[AdminLayout] /api/me error:', e);
        if (status === 401) {
          showToast('Session expirée, veuillez vous reconnecter', 'error');
        } else if (status === 403) {
          showToast('Accès réservé aux administrateurs', 'error');
        } else {
          const base = getApiBase();
          showToast(`Erreur réseau API${base ? ` (${base})` : ''}`, 'error');
        }
        router.replace('/');
        return;
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [api, router, showToast]);

  if (checking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white" edges={["top","bottom"]}>
        <StatusBar barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'} translucent={Platform.OS === 'android'} backgroundColor="transparent" />
        <Text className="text-slate-600">Chargement…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
      <StatusBar barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'} translucent={Platform.OS === 'android'} backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false }} />
      <View className="px-4 pt-3 pb-2 bg-white border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-quicksand-bold">Admin</Text>
          {meName ? <Text className="text-slate-500">{meName}</Text> : null}
        </View>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <NavTab label="Dashboard" href="./" active={pathname === '/(admin)'} />
          <NavTab label="Utilisateurs" href="./users" active={pathname?.startsWith('/(admin)/users') ?? false} />
          <NavTab label="Commandes" href="./orders" active={pathname?.startsWith('/(admin)/orders') ?? false} />
          <NavTab label="Zones" href="./zones" active={pathname?.startsWith('/(admin)/zones') ?? false} />
          <NavTab label="Profil" href="./profile" active={pathname?.startsWith('/(admin)/profile') ?? false} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavTab({ label, href, active }: { label: string; href: Href; active: boolean }) {
  return (
    <Link href={href} replace asChild>
      <TouchableOpacity
        className={`${active ? 'bg-emerald-600' : 'bg-slate-100'} px-3 py-2 rounded-full`}
        accessibilityRole="button"
      >
        <Text className={`${active ? 'text-white' : 'text-slate-700'} text-sm font-quicksand-bold`}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}
