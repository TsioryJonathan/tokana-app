// app/(client)/profile.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  Image,
} from "react-native";
// safe area handled by (client)/_layout
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type MobileMoney = "MVOLA" | "AIRTEL" | "ORANGE";

export default function Profile() {
  const router = useRouter();

  // --- Mock user (remplace par ton store / API) ---
  const [avatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("Rakoto Andry");
  const [phone, setPhone] = useState("+261341234567");
  const [email, setEmail] = useState("rakoto.andry@example.com");

  const [editing, setEditing] = useState(false);

  // Notifications & sécurité
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  // Carnet d’adresses
  const [addresses, setAddresses] = useState([
    { id: "1", label: "Maison", detail: "Ankorondrano, près de la station" },
    { id: "2", label: "Bureau", detail: "Ivandry, Immeuble ABC – 2e étage" },
  ]);

  // Paiements (Mobile Money)
  const [linkedPayments, setLinkedPayments] = useState<
    Record<MobileMoney, boolean>
  >({
    MVOLA: true,
    AIRTEL: false,
    ORANGE: false,
  });

  const canSave = useMemo(
    () =>
      name.trim().length > 1 &&
      /^\+?\d{7,15}$/.test(phone.replace(/\s/g, "")) &&
      (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) || email.trim() === ""),
    [name, phone, email]
  );

  const onSaveProfile = async () => {
    if (!canSave) {
      Alert.alert("Profil", "Vérifie tes informations.");
      return;
    }
    // TODO: await api.updateProfile({ name, phone, email })
    setEditing(false);
    Alert.alert("Profil", "Informations mises à jour.");
  };

  const toggleLink = async (m: MobileMoney) => {
    // TODO: appeler ton backend pour lier / délier le moyen de paiement
    setLinkedPayments((prev) => ({ ...prev, [m]: !prev[m] }));
  };

  const addAddress = () => {
    // TODO: ouvrir une modale / écran dédié
    const id = Date.now().toString();
    setAddresses((prev) => [
      ...prev,
      { id, label: "Nouvelle adresse", detail: "Précise l’adresse…" },
    ]);
  };

  const removeAddress = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          // TODO: await auth.signOut()
          router.replace("/(auth)/auth");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 py-3 bg-white border-b border-slate-200 flex-row items-center justify-between">
        <Text className="text-lg font-quicksand-bold text-slate-900">
          Mon profil
        </Text>
        {!editing ? (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="create-outline" size={18} color="#0F172A" />
              <Text className="ml-1 font-quicksand-semibold text-slate-900">
                Modifier
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setEditing(false)}
              activeOpacity={0.8}
              className="mr-3"
            >
              <Text className="font-quicksand-semibold text-slate-600">
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSaveProfile}
              activeOpacity={0.8}
              disabled={!canSave}
            >
              <Text
                className={`font-quicksand-bold ${
                  canSave ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Identité */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={54}
                  color="#64748B"
                />
              )}
            </View>
            <View className="ml-3 flex-1">
              {!editing ? (
                <>
                  <Text className="text-base font-quicksand-bold text-slate-900">
                    {name}
                  </Text>
                  <Text className="text-[12px] text-slate-600">{phone}</Text>
                  {email ? (
                    <Text className="text-[12px] text-slate-600">{email}</Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Labeled
                    value={name}
                    onChangeText={setName}
                    label="Nom complet"
                  />
                  <Labeled
                    value={phone}
                    onChangeText={setPhone}
                    label="Téléphone"
                    keyboardType="phone-pad"
                  />
                  <Labeled
                    value={email}
                    onChangeText={setEmail}
                    label="Email (optionnel)"
                    keyboardType="email-address"
                  />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Paiements */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <SectionHeader
            icon={<Ionicons name="card-outline" size={16} color="#0F172A" />}
            title="Paiements – Mobile Money"
          />
          <PaymentRow
            icon={
              <MaterialCommunityIcons
                name="cellphone-nfc"
                size={18}
                color="#0F172A"
              />
            }
            brand="MVola"
            linked={linkedPayments.MVOLA}
            onToggle={() => toggleLink("MVOLA")}
          />
          <View className="h-2" />
          <PaymentRow
            icon={
              <MaterialCommunityIcons
                name="cellphone-nfc"
                size={18}
                color="#0F172A"
              />
            }
            brand="Airtel Money"
            linked={linkedPayments.AIRTEL}
            onToggle={() => toggleLink("AIRTEL")}
          />
          <View className="h-2" />
          <PaymentRow
            icon={
              <MaterialCommunityIcons
                name="cellphone-nfc"
                size={18}
                color="#0F172A"
              />
            }
            brand="Orange Money"
            linked={linkedPayments.ORANGE}
            onToggle={() => toggleLink("ORANGE")}
          />
          <Text className="mt-2 text-[11px] text-slate-500">
            Liez vos comptes Mobile Money pour des paiements et remboursements
            rapides.
          </Text>
        </View>

        {/* Carnet d’adresses */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <SectionHeader
            icon={
              <Ionicons name="location-outline" size={16} color="#0F172A" />
            }
            title="Carnet d’adresses"
          />
          {addresses.map((a) => (
            <View
              key={a.id}
              className="flex-row items-start justify-between px-3 py-3 rounded-xl border border-slate-200 mb-2"
            >
              <View className="flex-1">
                <Text className="font-quicksand-semibold text-slate-900">
                  {a.label}
                </Text>
                <Text className="text-[12px] text-slate-600 mt-1">
                  {a.detail}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeAddress(a.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={addAddress}
            activeOpacity={0.85}
            className="mt-1 flex-row items-center self-start"
          >
            <Ionicons name="add-circle-outline" size={18} color="#059669" />
            <Text className="ml-1 text-emerald-700 font-quicksand-semibold">
              Ajouter une adresse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications & sécurité */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
          <SectionHeader
            icon={
              <Ionicons
                name="notifications-outline"
                size={16}
                color="#0F172A"
              />
            }
            title="Notifications"
          />
          <ToggleLine
            label="Notifications push"
            value={pushEnabled}
            onChange={setPushEnabled}
          />
          <View className="h-2" />
          <ToggleLine
            label="SMS statut livraison"
            value={smsEnabled}
            onChange={setSmsEnabled}
          />

          <View className="mt-4 border-t border-slate-200 pt-3" />
          <SectionHeader
            icon={
              <Ionicons name="lock-closed-outline" size={16} color="#0F172A" />
            }
            title="Sécurité"
          />
          <TouchableOpacity
            onPress={() => {
              // TODO: router.push("/(client)/security/change-password")
              Alert.alert(
                "Sécurité",
                "Écran de changement de mot de passe à implémenter."
              );
            }}
            activeOpacity={0.8}
            className="flex-row items-center justify-between px-3 py-3 rounded-xl border border-slate-200"
          >
            <Text className="font-quicksand-semibold text-slate-800">
              Changer le mot de passe
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </TouchableOpacity>

          <View className="h-2" />
          <ToggleLine
            label="Doubler l’authentification (2FA)"
            value={twoFA}
            onChange={setTwoFA}
          />
        </View>

        {/* Légal */}
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-5">
          <SectionHeader
            icon={
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#0F172A"
              />
            }
            title="Légal"
          />
          <LinkRow
            label="Conditions Générales"
            onPress={() => {
              /* TODO: openLink */
            }}
          />
          <View className="h-2" />
          <LinkRow
            label="Politique de confidentialité"
            onPress={() => {
              /* TODO: openLink */
            }}
          />
        </View>

        {/* Danger & logout */}
        <View className="px-1">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.9}
            className="bg-slate-900 px-5 py-3 rounded-xl items-center"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text className="ml-2 text-white font-quicksand-bold">
                Se déconnecter
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Supprimer mon compte",
                "Cette action est irréversible. Continuer ?",
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                      // TODO: await api.deleteAccount()
                    },
                  },
                ]
              )
            }
            activeOpacity={0.85}
            className="mt-3 px-5 py-3 rounded-xl border border-rose-300 items-center"
          >
            <Text className="text-rose-600 font-quicksand-semibold">
              Supprimer mon compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ====== Petits composants réutilisables ====== */
function Labeled({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
}) {
  return (
    <View className="mb-2">
      <Text className="text-[11px] text-slate-500">{label}</Text>
      <View className="bg-white rounded-xl border border-slate-200 px-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          className="py-2 text-[14px] text-slate-900"
        />
      </View>
    </View>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <View className="flex-row items-center mb-2">
      <View className="mr-2">{icon}</View>
      <Text className="text-[13px] font-quicksand-bold text-slate-900">
        {title}
      </Text>
    </View>
  );
}

function PaymentRow({
  icon,
  brand,
  linked,
  onToggle,
}: {
  icon: React.ReactNode;
  brand: string;
  linked: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-3 py-3 rounded-xl border border-slate-200">
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-2 font-quicksand-semibold text-slate-800">
          {brand}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.85}
        className={`px-3 py-1.5 rounded-full ${
          linked ? "bg-emerald-50" : "bg-slate-100"
        }`}
      >
        <Text
          className={`text-[12px] font-quicksand-semibold ${
            linked ? "text-emerald-700" : "text-slate-700"
          }`}
        >
          {linked ? "Lié" : "Lier"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ToggleLine({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-3 py-3 rounded-xl border border-slate-200">
      <Text className="font-quicksand-semibold text-slate-800">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: "#10B981", false: "#CBD5E1" }}
        thumbColor={
          Platform.OS === "android"
            ? value
              ? "#059669"
              : "#F8FAFC"
            : undefined
        }
      />
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center justify-between px-3 py-3 rounded-xl border border-slate-200"
    >
      <Text className="font-quicksand-semibold text-slate-800">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#64748B" />
    </TouchableOpacity>
  );
}
