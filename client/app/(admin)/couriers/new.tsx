import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminCouriers } from '../../../lib/hooks/useAdminCouriers';

export default function AdminCourierNewScreen() {
  const router = useRouter();
  const { createCourier } = useAdminCouriers();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gpsEnabled, setGpsEnabled] = useState(true);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      return;
    }

    setSubmitting(true);
    const success = await createCourier({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      gpsEnabled,
    });
    setSubmitting(false);

    if (success) {
      router.back();
    }
  };

  const canSubmit = name.trim() && email.trim() && phone.trim() && password.trim();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-quicksand-bold text-slate-900">Nouveau Livreur</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
            INFORMATIONS OBLIGATOIRES
          </Text>

          <View className="gap-3">
            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">
                Nom complet *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Rakoto Jean"
                placeholderTextColor="#94A3B8"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">Email *</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Ex: rakoto@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">
                Téléphone *
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Ex: +261201234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">
                Mot de passe *
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
            PARAMÈTRES GPS
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-slate-900 font-quicksand-semibold">
                Activer le tracking GPS
              </Text>
              <Text className="text-xs text-slate-500 font-quicksand mt-1">
                Le livreur pourra être suivi en temps réel
              </Text>
            </View>
            <Switch
              value={gpsEnabled}
              onValueChange={setGpsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`rounded-xl py-3 items-center ${
            canSubmit && !submitting ? 'bg-blue-600' : 'bg-slate-300'
          }`}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-quicksand-bold">Créer le livreur</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
