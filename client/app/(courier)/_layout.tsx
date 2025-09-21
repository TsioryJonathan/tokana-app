import React, { useEffect, useState } from 'react';
import { Platform, StatusBar, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { getAccessToken } from '@/lib/auth/session';
import { getApiClient } from '@/lib/api/client';

export default function CourierLayout() {
  const router = useRouter();
  const api = getApiClient();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!mounted) return;
          router.replace('/(auth)/auth');
          return;
        }
        // Optional role check: allow 'livreur' or 'admin'
        try {
          const me = await api.me.getApiMe();
          if (!mounted) return;
          if (me.role !== 'livreur' && me.role !== 'admin') {
            router.replace('/');
            return;
          }
        } catch {
          if (!mounted) return;
          router.replace('/');
          return;
        }
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [api, router]);

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
        <StatusBar
          barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
          translucent={Platform.OS === 'android'}
          backgroundColor="transparent"
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#475569' }}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
      <StatusBar
        barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
