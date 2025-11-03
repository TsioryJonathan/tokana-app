// app/(client)/profile.tsx
import React, { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/Auth/LogoutButton";
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
// import LogoutButton from "@/components/Auth/LogoutButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/Toast";
import { normalizeLocalPhone } from "@/utils/phone";
import { HeaderBackground } from "@/components/CreateOrder/RecapBackground";

type MobileMoney = "MVOLA" | "AIRTEL" | "ORANGE";

const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;

export default function Profile() {
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  // --- User depuis API ---
  const [avatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const canSave = useMemo(() => {
    const cleaned = normalizeLocalPhone(phone);
    const emailOk = (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) || email.trim() === "");
    const phoneOk = (cleaned === "" || mgPhoneRegex.test(cleaned));
    return name.trim().length > 1 && phoneOk && emailOk;
  }, [name, phone, email]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.me.getApiMe();
        if (!mounted) return;
        setName(me.name || "");
        setPhone(me.phone || "");
        setEmail(me.email || "");
        setRole(me.role || null);
      } catch (e) {
        console.warn("/api/me failed", e);
        showToast("Impossible de charger le profil", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const onSaveProfile = async () => {
    if (!canSave) {
      showToast("Vérifie tes informations", "error");
      return;
    }
    showToast("Mise à jour du profil bientôt disponible", "info");
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

  // Logout handled by reusable LogoutButton with confirm

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
        <HeaderBackground source={require("@/assets/images/orders-bg.png")} height={260} opacity={0.75} gradientHeight={140} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, marginTop: -120 }}>
        {/* Avatar camera circle */}
        <View className="self-center w-28 h-28 rounded-full bg-white/90 items-center justify-center border border-slate-200 shadow-sm">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={{ width: 112, height: 112, borderRadius: 9999 }} />
          ) : (
            <Ionicons name="camera-outline" size={36} color="#64748B" />
          )}
        </View>

        {/* White card with rows */}
        <View className="mt-6 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
          <KVRow label="Name" value={name || "-"} onPress={() => setEditing(true)} showDivider />
          <KVRow label="Phone" value={phone || "-"} onPress={() => setEditing(true)} showDivider />
          <KVRow label="Gender" value={(role || "").toUpperCase() || "-"} onPress={() => setEditing(true)} showDivider />
          <KVRow label="Saved Addresses" value={String(addresses.length)} onPress={() => { /* could navigate */ }} />
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={onSaveProfile}
          activeOpacity={0.9}
          disabled={!canSave}
          className="mt-10 items-center"
        >
          <View className={`w-full py-4 rounded-full ${canSave ? 'bg-yellow-400' : 'bg-yellow-200'}`}>
            <Text className="text-center text-slate-900 font-quicksand-bold">Save</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <LogoutButton />
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
