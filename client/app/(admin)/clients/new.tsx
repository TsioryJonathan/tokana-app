import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminClients } from '../../../lib/hooks/useAdminClients';

export default function AdminClientNewScreen() {
  const router = useRouter();
  const { createClient } = useAdminClients();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const zones = ['TANA-VILLE', 'PÉRIPHÉRIE', 'SUPER-PÉRIPHÉRIE'];

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      return;
    }

    setSubmitting(true);
    const success = await createClient({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      zone: zone || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
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
        <Text className="text-lg font-quicksand-bold text-slate-900">Nouveau Client</Text>
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
                placeholder="Ex: Jean Dupont"
                placeholderTextColor="#94A3B8"
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">Email *</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Ex: jean@example.com"
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
            INFORMATIONS OPTIONNELLES
          </Text>

          <View className="gap-3">
            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">Zone</Text>
              <View className="flex-row flex-wrap gap-2">
                {zones.map((z) => (
                  <TouchableOpacity
                    key={z}
                    onPress={() => setZone(zone === z ? '' : z)}
                    className={`px-3 py-2 rounded-xl ${
                      zone === z ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-xs font-quicksand-semibold ${
                        zone === z ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {z}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">Adresse</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Ex: Lot 123, Rue ABC, Antananarivo"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>

            <View>
              <Text className="text-xs text-slate-700 font-quicksand-semibold mb-1">Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes internes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`rounded-xl py-3 items-center ${
            canSubmit && !submitting ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-quicksand-bold">Créer le client</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
