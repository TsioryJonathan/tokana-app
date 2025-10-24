// app/(client)/profile.tsx
import React from "react";
import LogoutButton from "@/components/Auth/LogoutButton"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
// import LogoutButton from "@/components/Auth/LogoutButton";
// safe area handled by (client)/_layout
import { Ionicons } from "@expo/vector-icons";
import { HeaderBackground } from "@/components/CreateOrder/RecapBackground";
import { useProfile } from "@/hooks/useProfile";
import PrimaryButton from "@/components/ui/PrimaryButton";

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
    addressEdit,
    canSave,
    isDirty,
    setName,
    setPhone,
    setEmail,
    setAddressEdit,
    pickAvatar,
    onSaveProfile,
    resetProfile,
  } = useProfile();

  // Ref to focus the address input when tapping "Adresses enregistrées"
  const addressInputRef = React.useRef<TextInput | null>(null);

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
        {/* Avatar with centered camera overlay */}
        <View className="items-center">
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Ajouter ou changer la photo de profil"
            className="w-32 h-32 rounded-full overflow-hidden bg-white/90 items-center justify-center border border-slate-200 shadow-md z-10"
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : null}
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-white/80 items-center justify-center">
                <Ionicons name="camera-outline" size={32} color="#94A3B8" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} className="mt-2">
            <Text className="text-[12px] text-slate-500">Ajouter une photo</Text>
          </TouchableOpacity>
        </View>

        {/* White card with rows or editable inputs */}
        <View className="mt-6 bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
          {editing ? (
            <View>
              <LabeledInput label="Nom" value={name} onChangeText={setName} placeholder="Ton nom" />
              <Divider />
              <LabeledInput
                label="Téléphone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="0XXXXXXXXX ou +261XXXXXXXXX"
                helper={phone ? (phoneVerifiedAt ? 'Vérifié' : 'Non vérifié') : ''}
              />
              <Divider />
              <LabeledInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="email@exemple.com"
                helper={email ? (emailVerifiedAt ? 'Vérifié' : 'Non vérifié') : ''}
              />
              <Divider />
              <LabeledInput
                label="Adresse"
                value={addressEdit}
                onChangeText={setAddressEdit}
                placeholder="Adresse (ex: lot, rue, quartier)"
                inputRef={addressInputRef}
              />
              <Divider />
              <KVRow
                label="Rôle"
                value={role === 'admin' ? 'Admin' : role === 'livreur' ? 'Livreur' : role === 'client' ? 'Client' : '-'}
              />
              <Divider />
              <KVRow label="Adresses enregistrées" value={String(addresses.length)} onPress={() => addressInputRef.current?.focus()} />
            </View>
          ) : (
            <View>
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
                label="Adresse"
                value={addressEdit || '-'}
                onPress={() => setEditing(true)}
                showDivider
              />
              <KVRow
                label="Rôle"
                value={role === 'admin' ? 'Admin' : role === 'livreur' ? 'Livreur' : role === 'client' ? 'Client' : '-'}
                showDivider
              />
              <KVRow
                label="Adresses enregistrées"
                value={String(addresses.length)}
                onPress={() => {
                  setEditing(true);
                  setTimeout(() => addressInputRef.current?.focus(), 0);
                }}
              />
            </View>
          )}
        </View>

        {/* Action bar: show only in editing mode */}
        {editing ? (
          <View className="mt-8 flex-row">
            <View className="flex-1">
              <PrimaryButton
                onPress={resetProfile}
                className="rounded-full bg-slate-100 border border-slate-300"
                textClassName="text-slate-800 font-quicksand-semibold"
                accessibilityLabel="Annuler les modifications"
              >
                Annuler
              </PrimaryButton>
            </View>
            <View className="flex-1">
              <PrimaryButton
                onPress={onSaveProfile}
                disabled={!canSave || !isDirty}
                className={`rounded-full ${!canSave || !isDirty ? 'bg-yellow-200' : 'bg-yellow-400'}`}
                textClassName="text-slate-900 font-quicksand-bold"
                accessibilityLabel="Enregistrer les modifications"
              >
                Enregistrer
              </PrimaryButton>
            </View>
          </View>
        ) : null}
        {/* Logout button styled similarly (yellow pill) */}
        <View className="mt-3">
          <LogoutButton
            title="Se déconnecter"
            confirm
            className="rounded-full bg-[#facc15]"
            textClassName="text-slate-900 font-quicksand-bold"
          />
        </View>
      </ScrollView>
    </View>
  );
}
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

function Divider() {
  return <View className="h-[1px] bg-slate-100 mx-2" />;
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  helper,
  inputRef,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
  helper?: string;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  return (
    <View className="px-2 py-2">
      <Text className="text-[13px] text-slate-800 font-quicksand-semibold mb-1">{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className="border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700"
      />
      {helper ? <Text className="mt-1 text-[11px] text-slate-400">{helper}</Text> : null}
    </View>
  );
}
