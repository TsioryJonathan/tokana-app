import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any | null>(null);

  const createLivreur = async () => {
    if (loading) return;
    setLoading(true);
    setCreated(null);
    try {
      const res = await api.adminUsers.postApiAdminUsers({ name, phone, email, password });
      setCreated(res);
      showToast('Livreur créé', 'success');
      setName(''); setPhone(''); setEmail(''); setPassword('');
    } catch (e: any) {
      console.warn('create livreur error', e);
      showToast('Création livreur échouée', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <Text className="text-xl font-quicksand-bold text-slate-900">Utilisateurs</Text>
        <Text className="text-slate-500 mt-1">Gestion des livreurs</Text>
      </View>
      <View className="p-4">
        <View
          className="bg-white border border-slate-200 rounded-2xl p-4"
          style={{
            elevation: 1,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="font-quicksand-bold mb-3 text-slate-900">Créer un livreur</Text>
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-2" placeholder="Nom" value={name} onChangeText={setName} />
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-2" placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-2" placeholder="Email (optionnel)" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-3" placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity className={`rounded-lg bg-emerald-600 ${loading ? 'opacity-50' : ''}`} onPress={createLivreur} disabled={loading}>
            <Text className="text-white text-center py-3">{loading ? 'Création…' : 'Créer'}</Text>
          </TouchableOpacity>
          {created && (
            <Text className="text-emerald-700 mt-3">Créé: {created.name} ({created.phone})</Text>
          )}
        </View>
        <Text className="text-slate-500 mt-6">Plus de fonctionnalités arriveront ici (liste, recherche, rôles, etc.).</Text>
      </View>
    </View>
  );
}
