// app/(client)/profile.tsx
import React from "react";
import LogoutButton from "@/components/Auth/LogoutButton"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
// import LogoutButton from "@/components/Auth/LogoutButton";
// safe area handled by (client)/_layout
import { Ionicons } from "@expo/vector-icons";
import { HeaderBackground } from "@/components/CreateOrder/RecapBackground";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
  const {
    loading,
    editing,
    setEditing,
    avatarUrl,
    name,
    phone,
    email,
    role,
    phoneVerifiedAt,
    emailVerifiedAt,
    addresses,
    canSave,
    setName,
    setPhone,
    setEmail,
    pickAvatar,
    onSaveProfile,
  } = useProfile();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement du profil…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header illustration with gradient */}
      <View style={{ height: 260 }}>
        <HeaderBackground source={require("@/assets/images/profile-bg.png")} height={260} opacity={0.75} gradientHeight={140} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, marginTop: -120 }}>
        {/* Avatar camera circle + caption */}
        <View className="items-center">
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Ajouter ou changer la photo de profil"
            className="w-32 h-32 rounded-full bg-white/90 items-center justify-center border border-slate-200 shadow-md"
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 128, height: 128, borderRadius: 9999 }} />
            ) : (
              <Ionicons name="camera-outline" size={40} color="#94A3B8" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} className="mt-2">
            <Text className="text-[12px] text-slate-500">Ajouter une photo</Text>
          </TouchableOpacity>
        </View>

        {/* White card with rows */}
        <View className="mt-6 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
          <KVRow label="Nom" value={name || "-"} onPress={() => setEditing(true)} showDivider />
          <KVRow
            label="Téléphone"
            value={`${phone || '-'}` + (phone ? (phoneVerifiedAt ? ' · Vérifié' : ' · Non vérifié') : '')}
            onPress={() => setEditing(true)}
            showDivider
          />
          <KVRow
            label="Email"
            value={`${email || '-'}` + (email ? (emailVerifiedAt ? ' · Vérifié' : ' · Non vérifié') : '')}
            onPress={() => setEditing(true)}
            showDivider
          />
          <KVRow
            label="Rôle"
            value={role === 'admin' ? 'Admin' : role === 'livreur' ? 'Livreur' : role === 'client' ? 'Client' : '-'}
            showDivider
          />
          <KVRow label="Adresses enregistrées" value={String(addresses.length)} onPress={() => { /* could navigate */ }} />
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={onSaveProfile}
          activeOpacity={0.9}
          disabled={!canSave}
          className="mt-10 items-center"
        >
          <View className={`w-full py-4 rounded-full ${canSave ? 'bg-yellow-400' : 'bg-yellow-200'}`}>
            <Text className="text-center text-slate-900 font-quicksand-bold">Enregistrer</Text>
          </View>
        </TouchableOpacity>
        {/* Single logout button at bottom */}
        <View className=" mt-4">
          <LogoutButton title="Se déconnecter" confirm className="rounded-full w-full text-slate-900" />
        </View>
      </ScrollView>
    </View>
  );
}

/* ====== Petits composants réutilisables ====== */
function KVRow({ label, value, onPress, showDivider }: { label: string; value: string; onPress?: () => void; showDivider?: boolean }) {
  return (
    <>

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        className="flex-row items-center justify-between px-3 py-3 rounded-xl"
      >
        <Text className="text-[13px] text-slate-800 font-quicksand-semibold">{label}</Text>
        <View className="flex-row items-center">
          <Text className="mr-1 text-[13px] text-slate-500">{value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
      {showDivider ? <View className="h-[1px] bg-slate-100 mx-3" /> : null}

    </>
  );
}
