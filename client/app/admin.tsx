import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { TokanaApiClient } from './lib/api';
import { getAccessToken } from './lib/auth/session';

export default function AdminPage() {
  const api = useMemo(() => new TokanaApiClient({
    TOKEN: async () => (await getAccessToken()) || '',
  }), []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const onCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body: any = { name: name.trim(), phone: phone.trim(), password };
      if (email.trim()) body.email = email.trim();
      const res = await api.adminUsers.postApiAdminUsers(body);
      setResult(res);
      Alert.alert('Succès', 'Livreur créé');
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || 'Erreur';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Admin — Créer un livreur</Text>

      <Text>Nom</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Nom" autoCapitalize="words" />

      <Text>Téléphone (MG)</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="+26120xxxxxxx ou 020xxxxxxx" keyboardType="phone-pad" />

      <Text>Email (optionnel)</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />

      <Text>Mot de passe</Text>
      <TextInput value={password} onChangeText={setPassword} placeholder="******" secureTextEntry />

      <Button title={loading ? 'En cours...' : 'Créer livreur'} onPress={onCreate} disabled={loading || !name || !phone || !password} />

      {result && (
        <View style={{ marginTop: 12 }}>
          <Text>Résultat:</Text>
          <Text selectable>{JSON.stringify(result, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}
