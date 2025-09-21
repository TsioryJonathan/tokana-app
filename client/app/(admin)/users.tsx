import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { ApiError, User } from '@/lib/api';

export default function AdminUsersPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any | null>(null);
  const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;
  const canCreate = useMemo(() => {
    if (!name.trim()) return false;
    if (!mgPhoneRegex.test(phone.trim())) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) return false;
    if (!password || password.length < 6) return false;
    return true;
  }, [name, phone, email, password]);

  // Listing state
  const [roleTab, setRoleTab] = useState<'client' | 'livreur'>('client');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createLivreur = async () => {
    if (loading) return;
    setLoading(true);
    setCreated(null);
    try {
      if (!mgPhoneRegex.test(phone.trim())) {
        showToast('Téléphone invalide. Ex: +261201234567 ou 0201234567', 'error');
        return;
      }
      const res = await api.adminUsers.postApiAdminUsers({ name, phone, email, password });
      setCreated(res);
      showToast('Livreur créé', 'success');
      setName(''); setPhone(''); setEmail(''); setPassword('');
    } catch (e: any) {
      console.warn('create livreur error', e);
      const msg: string = e?.body?.msg || e?.message || 'Création livreur échouée';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (params?: { role?: 'client'|'livreur'|'admin'; q?: string; page?: number; limit?: number; }) => {
    if (loadingList) return;
    setLoadingList(true);
    try {
      const res = await api.adminUsers.getApiAdminUsers(params?.role, params?.q, params?.page ?? page, params?.limit ?? limit);
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[AdminUsers] getApiAdminUsers error:', e);
      let status: number | undefined;
      if (e instanceof ApiError) status = e.status;
      if (status === 401) {
        showToast('Session expirée, veuillez vous reconnecter', 'error');
      } else if (status === 403) {
        showToast('Accès réservé aux administrateurs', 'error');
      } else {
        showToast('Chargement des utilisateurs échoué', 'error');
      }
    } finally {
      setLoadingList(false);
    }
  };

  // Initial load and when role/page changes
  useEffect(() => {
    fetchUsers({ role: roleTab, q, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleTab, page]);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers({ role: roleTab, q, page: 1, limit });
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
        <Text className="text-xl font-quicksand-bold text-slate-900">Utilisateurs</Text>
        <Text className="text-slate-500 mt-1">Gestion des utilisateurs (clients / livreurs)</Text>
      </View>
      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Create Livreur */}
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
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-2" placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" autoComplete="tel" />
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-2" placeholder="Email (optionnel)" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="username" autoComplete="email" />
          <TextInput className="border border-slate-300 rounded-lg px-3 py-2 mb-3" placeholder="Mot de passe (≥ 6)" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" autoComplete="new-password" />
          <TouchableOpacity className={`rounded-lg bg-emerald-600 ${loading || !canCreate ? 'opacity-50' : ''}`} onPress={createLivreur} disabled={loading || !canCreate}>
            <Text className="text-white text-center py-3">{loading ? 'Création…' : 'Créer'}</Text>
          </TouchableOpacity>
          {created && (
            <Text className="text-emerald-700 mt-3">Créé: {created.name} ({created.phone})</Text>
          )}
        </View>

        {/* Tabs + Search */}
        <View className="mt-6">
          <View className="flex-row bg-white border border-slate-200 rounded-2xl p-2 items-center">
            <View className="flex-row gap-2 flex-1">
              <TouchableOpacity onPress={() => { setRoleTab('client'); setPage(1); }} className={`px-3 py-2 rounded-lg ${roleTab === 'client' ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                <Text className={`${roleTab === 'client' ? 'text-white' : 'text-slate-700'}`}>Clients</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setRoleTab('livreur'); setPage(1); }} className={`px-3 py-2 rounded-lg ${roleTab === 'livreur' ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                <Text className={`${roleTab === 'livreur' ? 'text-white' : 'text-slate-700'}`}>Livreurs</Text>
              </TouchableOpacity>
            </View>
            <View className="w-[1px] h-6 bg-slate-200 mx-2" />
            <View className="flex-1">
              <TextInput value={q} onChangeText={setQ} placeholder="Recherche (nom, email, téléphone)" className="border border-slate-300 rounded-lg px-3 py-2" />
            </View>
          </View>
        </View>

        {/* List */}
        <View className="mt-3 bg-white border border-slate-200 rounded-2xl">
          {loadingList ? (
            <View className="p-6 items-center justify-center"><ActivityIndicator size="small" color="#059669" /></View>
          ) : (
            <View>
              {items.length === 0 ? (
                <Text className="p-4 text-slate-500">Aucun utilisateur trouvé.</Text>
              ) : (
                <View>
                  {items.map((u) => (
                    <View key={u.id} className="px-4 py-3 border-b border-slate-100">
                      <Text className="text-slate-900 font-quicksand-bold">{u.name ?? '(Sans nom)'} <Text className="text-xs text-slate-500">#{u.id}</Text></Text>
                      <Text className="text-slate-700">{u.phone}{u.email ? ` · ${u.email}` : ''}</Text>
                      <View className="mt-1 self-start px-2 py-0.5 rounded-full bg-slate-100">
                        <Text className="text-xs text-slate-700">{u.role}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {/* Pagination */}
              <View className="flex-row items-center justify-between p-3">
                <Text className="text-slate-500">Page {page} / {pages} · {total} utilisateurs</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity disabled={page <= 1} onPress={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-2 rounded-lg ${page <= 1 ? 'bg-slate-100' : 'bg-slate-200'}`}>
                    <Text className="text-slate-700">Précédent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={page >= pages} onPress={() => setPage((p) => Math.min(pages, p + 1))} className={`px-3 py-2 rounded-lg ${page >= pages ? 'bg-slate-100' : 'bg-slate-200'}`}>
                    <Text className="text-slate-700">Suivant</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
