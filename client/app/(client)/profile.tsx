// app/(client)/profile.tsx
import React, { useEffect, useState, useMemo } from "react";
import LogoutButton from "../../components/Auth/LogoutButton"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
// import LogoutButton from "../../components/Auth/LogoutButton";
// safe area handled by (client)/_layout
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderBackground } from "../../components/CreateOrder/RecapBackground";
import { useProfile } from "../../hooks/useProfile";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { getApiClient } from "../../lib/api/client";
import { Wallet, CheckCircle, Clock, CreditCard } from "lucide-react-native";

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // État pour le suivi des comptes (montants à remettre)
  const api = useMemo(getApiClient, []);
  const [accountStatus, setAccountStatus] = useState<{
    amountToReceive: number;
    amountReceived: number;
    paymentMethod: string | null;
    lastPaymentDate: string | null;
    status: 'pending' | 'paid' | 'partial';
  } | null>(null);
  const [loadingAccountStatus, setLoadingAccountStatus] = useState(true);

  useEffect(() => {
    const fetchAccountStatus = async () => {
      try {
        // Appel API pour récupérer le statut des comptes du client
        const response = await api.request.request({
          method: 'GET',
          url: '/api/client/account-status',
        } as any);
        if (response) {
          setAccountStatus(response as any);
        }
      } catch (e) {
        // En cas d'erreur, on affiche des valeurs par défaut
        setAccountStatus({
          amountToReceive: 0,
          amountReceived: 0,
          paymentMethod: null,
          lastPaymentDate: null,
          status: 'pending',
        });
      } finally {
        setLoadingAccountStatus(false);
      }
    };
    fetchAccountStatus();
  }, [api]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement du profil…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header illustration with gradient - positioned absolutely */}
      <View style={{ height: 260, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
        <HeaderBackground source={require("../../assets/images/profile-bg.png")} height={260} opacity={0.75} gradientHeight={140} />
      </View>

      {/* Bouton retour */}
      <View style={{ position: 'absolute', top: insets.top + 10, left: 16, zIndex: 30 }}>
        <TouchableOpacity
          onPress={() => router.replace('/(client)/home')}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 bg-white/90 rounded-full px-4 py-2 shadow-md"
          style={{ elevation: 5 }}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 140 }}
        style={{ zIndex: 10 }}
      >
        {/* Avatar with centered camera overlay */}
        <View className="items-center mb-4">
          <TouchableOpacity
            onPress={pickAvatar}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Ajouter ou changer la photo de profil"
            className="w-32 h-32 rounded-full overflow-hidden bg-white items-center justify-center border-4 border-white shadow-lg"
            style={{ elevation: 10, zIndex: 20 }}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <View className="w-full h-full bg-slate-100" />
            )}
            <View className="absolute inset-0 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center shadow-sm">
                <Ionicons name="camera-outline" size={32} color="#64748B" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} className="mt-2">
            <Text className="text-[12px] text-slate-500">Ajouter une photo</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION: Statut de suivi des comptes */}
        <View className="mt-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 shadow-sm border border-emerald-200">
          <View className="flex-row items-center mb-3">
            <Wallet size={20} color="#059669" strokeWidth={2} />
            <Text className="ml-2 text-base font-quicksand-bold text-emerald-800">
              Statut de suivi des comptes
            </Text>
          </View>

          {loadingAccountStatus ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#059669" />
            </View>
          ) : accountStatus ? (
            <View>
              {/* Montant à recevoir */}
              <View className="bg-white rounded-xl p-3 mb-2 border border-emerald-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-emerald-100 p-2 rounded-full mr-2">
                      <Wallet size={16} color="#059669" />
                    </View>
                    <Text className="text-sm text-gray-700">Montant à recevoir</Text>
                  </View>
                  <Text className="text-lg font-quicksand-bold text-emerald-600">
                    {accountStatus.amountToReceive.toLocaleString()} Ar
                  </Text>
                </View>
              </View>

              {/* Argent remis */}
              <View className="bg-white rounded-xl p-3 mb-2 border border-blue-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className={`p-2 rounded-full mr-2 ${accountStatus.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      {accountStatus.status === 'paid' ? (
                        <CheckCircle size={16} color="#059669" />
                      ) : (
                        <Clock size={16} color="#D97706" />
                      )}
                    </View>
                    <Text className="text-sm text-gray-700">Argent remis</Text>
                  </View>
                  <Text className={`text-lg font-quicksand-bold ${accountStatus.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {accountStatus.amountReceived.toLocaleString()} Ar
                  </Text>
                </View>
                {accountStatus.status === 'paid' && accountStatus.paymentMethod && (
                  <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
                    <CreditCard size={14} color="#64748B" />
                    <Text className="ml-1 text-xs text-gray-500">
                      Via {accountStatus.paymentMethod}
                      {accountStatus.lastPaymentDate && ` • ${new Date(accountStatus.lastPaymentDate).toLocaleDateString('fr-FR')}`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Statut global */}
              <View className={`rounded-xl p-2 ${
                accountStatus.status === 'paid' 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : accountStatus.status === 'partial'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}>
                <Text className={`text-center text-xs font-quicksand-semibold ${
                  accountStatus.status === 'paid' 
                    ? 'text-emerald-700' 
                    : accountStatus.status === 'partial'
                      ? 'text-amber-700'
                      : 'text-gray-600'
                }`}>
                  {accountStatus.status === 'paid' 
                    ? '✓ Compte réglé' 
                    : accountStatus.status === 'partial'
                      ? '⏳ Règlement partiel'
                      : '○ En attente de règlement'}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-sm text-gray-500 text-center py-2">
              Aucune information disponible
            </Text>
          )}
        </View>

        {/* White card with rows or editable inputs */}
        <View className="mt-4 bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
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
                onPress={() => router.push("/addresses")}
                showDivider
              />
              <KVRow
                label="Contacts sauvegardés"
                value="Gérer"
                onPress={() => router.push("/(client)/contacts")}
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
