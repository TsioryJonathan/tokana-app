import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { getApiClient } from "@/lib/api/client";
import LogoutButton from "@/components/Auth/LogoutButton";
import { useRouter } from "expo-router";

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
        console.warn("load admin profile failed", e);
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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <Text className="text-xl font-quicksand-bold text-slate-900">
          Profil admin
        </Text>
      </View>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="m-4 bg-white border border-slate-200 rounded-2xl p-4"
          style={{
            elevation: 1,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-slate-700 mb-1">
            Nom:{" "}
            <Text className="font-quicksand-bold text-slate-900">
              {me?.name ?? "—"}
            </Text>
          </Text>
          <Text className="text-slate-700 mb-1">
            Email: <Text className="text-slate-900">{me?.email ?? "—"}</Text>
          </Text>
          <Text className="text-slate-700 mb-1">
            Téléphone: <Text className="text-slate-900">{me?.phone ?? "—"}</Text>
          </Text>
          <Text className="text-slate-700">
            Rôle: <Text className="text-slate-900">{me?.role ?? "—"}</Text>
          </Text>
        </View>
        <View className="px-4 mb-4">
          <LogoutButton
            title="Se déconnecter"
            confirm
            className="bg-slate-900 rounded-xl"
            textClassName="font-quicksand-bold text-white"
            onLoggedOut={() => {
              router.replace("/(auth)/login" as any);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
