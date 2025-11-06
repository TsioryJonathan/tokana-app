import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiClient } from '@/lib/api/client';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Phone, Shield, LogOut } from 'lucide-react-native';
import { clearSession, getRefreshToken } from '@/lib/auth/session';

export default function AdminProfile() {
  const api = useMemo(getApiClient, []);
  const router = useRouter();
  const [me, setMe] = useState<{
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await api.me.getApiMe();
        if (!mounted) return;
        setMe(m);
      } catch (e) {
        console.warn('load admin profile failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-600 mt-4 font-quicksand">Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-6 px-6"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-clash-bold mb-1">Profil</Text>
            <Text className="text-emerald-100 text-sm font-quicksand">
              Informations de votre compte
            </Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <User size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          {/* Card profil */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <View className="items-center mb-6">
              <View className="bg-emerald-100 rounded-full p-6 mb-4">
                <User size={48} color="#059669" strokeWidth={2} />
              </View>
              <Text className="text-gray-900 font-clash-bold text-2xl mb-1">
                {me?.name ?? '—'}
              </Text>
              <View className="bg-emerald-100 rounded-full px-4 py-1.5 mt-2">
                <View className="flex-row items-center gap-2">
                  <Shield size={14} color="#059669" />
                  <Text className="text-emerald-700 font-quicksand-bold text-sm capitalize">
                    {me?.role ?? '—'}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              {/* Email */}
              {me?.email && (
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-emerald-100 rounded-lg p-2">
                      <Mail size={18} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs font-quicksand-medium mb-1">Email</Text>
                      <Text className="text-gray-900 font-quicksand-semibold">{me.email}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Phone */}
              {me?.phone && (
                <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <View className="flex-row items-center gap-3">
                    <View className="bg-emerald-100 rounded-lg p-2">
                      <Phone size={18} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 text-xs font-quicksand-medium mb-1">Téléphone</Text>
                      <Text className="text-gray-900 font-quicksand-semibold">{me.phone}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Bouton déconnexion */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TouchableOpacity
              className="rounded-xl overflow-hidden"
              onPress={() => {
                Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Se déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const rt = await getRefreshToken();
                        if (rt) {
                          try {
                            await api.auth.postApiAuthLogout({ refreshToken: rt });
                          } catch (e) {
                            console.warn('logout api error', e);
                          }
                        }
                      } finally {
                        await clearSession();
                        router.replace('/(auth)/login' as any);
                      }
                    },
                  },
                ]);
              }}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#EF4444', '#DC2626']} className="py-4 items-center">
                <View className="flex-row items-center gap-2">
                  <LogOut size={20} color="#fff" />
                  <Text className="text-white font-quicksand-bold text-base">Se déconnecter</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
