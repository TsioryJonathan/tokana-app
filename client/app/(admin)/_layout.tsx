import React, { useEffect, useMemo, useState } from 'react';
import { Link, Stack, usePathname, useRouter, type Href } from 'expo-router';
import { View, Text, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';

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
        showToast('Session invalide', 'error');
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
