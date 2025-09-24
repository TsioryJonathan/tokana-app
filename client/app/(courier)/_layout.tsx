import React from 'react';
import { Platform, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';

export default function CourierLayout() {
  const { checking } = useAuthGuard({ requireAuth: true, allowedRoles: ['livreur', 'admin'] });

  if (checking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top","bottom"]}>
        <StatusBar
          barStyle={Platform.OS === 'android' ? 'dark-content' : 'dark-content'}
          translucent={Platform.OS === 'android'}
          backgroundColor="transparent"
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#059669" size="large" />
          <Text style={{ color: '#475569', marginTop: 8 }}>Chargement…</Text>
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
