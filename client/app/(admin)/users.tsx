import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';
import { ApiError, User } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, UserPlus, Search, ChevronLeft, ChevronRight, Mail, Phone, Shield } from 'lucide-react-native';

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
  const normalizeLocalPhone = (input: string) => input.trim().replace(/[\s.\-()]/g, '');
  const canCreate = useMemo(() => {
    if (!name.trim()) return false;
    const cleaned = normalizeLocalPhone(phone);
    if (!mgPhoneRegex.test(cleaned)) return false;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) return false;
    if (!password || password.length < 6) return false;
    return true;
  }, [name, phone, email, password]);

  const [roleTab, setRoleTab] = useState<'client' | 'livreur'>('client');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<'client' | 'livreur' | null>(null);

  const createFromForm = async () => {
    if (loading) return;
    setLoading(true);
    setCreated(null);
    try {
      const cleaned = normalizeLocalPhone(phone);
      if (!mgPhoneRegex.test(cleaned)) {
        showToast('Téléphone invalide. Ex: +261201234567 ou 0201234567', 'error');
        return;
      }
      const payload = { name, phone: cleaned, email, password };
      const isClient = roleTab === 'client';
      let res;
      if (editingId != null) {
        const updatePayload = { ...payload } as any;
        if (!password) {
          delete updatePayload.password;
        }
        res = await api.adminUsers.putApiAdminUsers(editingId, updatePayload);
        setCreated(res);
        showToast(isClient ? 'Client mis à jour' : 'Livreur mis à jour', 'success');
      } else {
        res = isClient
          ? await api.adminUsers.postApiAdminUsersClient(payload)
          : await api.adminUsers.postApiAdminUsers(payload);
        setCreated(res);
        showToast(isClient ? 'Client créé' : 'Livreur créé', 'success');
      }
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      const targetRole = isClient ? 'client' : 'livreur';
      setRoleTab(targetRole);
      setPage(1);
      await fetchUsers({ role: targetRole, q: '', page: 1, limit });
      setEditingId(null);
      setEditingRole(null);
    } catch (e: any) {
      
      const msg: string = e?.body?.msg || e?.message || 'Action sur l’utilisateur échouée';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onEditUser = (u: User) => {
    if (!u.id) return;
    if (u.role !== 'client' && u.role !== 'livreur') return;
    setEditingId(u.id);
    setEditingRole(u.role);
    setRoleTab(u.role);
    setName(u.name ?? '');
    setPhone(u.phone ?? '');
    setEmail(u.email ?? '');
    setPassword('');
    setCreated(null);
  };

  const deleteUser = async (u: User) => {
    if (!u.id) return;
    try {
      await api.adminUsers.deleteApiAdminUsers(u.id);
      showToast('Utilisateur supprimé', 'success');
      await fetchUsers({ role: roleTab, q, page, limit });
    } catch (e: any) {
      console.error('[AdminUsers] deleteApiAdminUsers error:', e);
      const msg: string = e?.body?.msg || e?.message || 'Suppression échouée';
      showToast(msg, 'error');
    }
  };

  const fetchUsers = async (params?: { role?: 'client' | 'livreur' | 'admin'; q?: string; page?: number; limit?: number }) => {
    if (loadingList) return;
    setLoadingList(true);
    try {
      const res = await api.adminUsers.getApiAdminUsers(params?.role, params?.q, params?.page ?? page, params?.limit ?? limit);
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch (e) {
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

  useEffect(() => {
    fetchUsers({ role: roleTab, q, page, limit });
  }, [roleTab, page]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers({ role: roleTab, q, page: 1, limit });
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [q]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top']}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#059669', '#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-6 pb-6 px-6"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-clash-bold mb-1">Utilisateurs</Text>
            <Text className="text-emerald-100 text-sm font-quicksand">
              Gestion des clients et livreurs
            </Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <Users size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          {/* Créer un utilisateur (client ou livreur selon l'onglet) */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-emerald-100 rounded-lg p-2">
                <UserPlus size={20} color="#059669" strokeWidth={2.5} />
              </View>
              <Text className="text-gray-900 font-quicksand-bold text-lg">
                {editingId
                  ? roleTab === 'client'
                    ? 'Modifier un client'
                    : 'Modifier un livreur'
                  : roleTab === 'client'
                    ? 'Créer un client'
                    : 'Créer un livreur'}
              </Text>
            </View>
            <View>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
                placeholder="Nom (requis)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
                placeholder="Téléphone (requis) — ex: +2613XXXXXXXX ou 020XXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
                placeholder="Email (optionnel)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                textContentType="username"
                autoComplete="email"
              />
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-quicksand mb-3"
                placeholder="Mot de passe (requis, ≥ 6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <TouchableOpacity
                className={`rounded-xl overflow-hidden ${loading || !canCreate ? 'opacity-50' : ''}`}
                onPress={createFromForm}
                disabled={loading || !canCreate}
                activeOpacity={0.7}
              >
                <LinearGradient colors={['#059669', '#047857']} className="py-4">
                  <Text className="text-white text-center font-quicksand-bold">
                    {loading
                      ? 'En cours…'
                      : editingId
                        ? roleTab === 'client'
                          ? 'Mettre à jour le client'
                          : 'Mettre à jour le livreur'
                        : roleTab === 'client'
                          ? 'Créer le client'
                          : 'Créer le livreur'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              {created && (
                <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <Text className="text-emerald-700 font-quicksand-semibold text-sm">
                    ✓ Créé: {created.name} ({created.phone})
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tabs + Search */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-4">
            <View className="flex-row gap-2 mb-3">
              {(['client', 'livreur'] as const).map((tab) => {
                const isActive = roleTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => {
                      setRoleTab(tab);
                      setPage(1);
                    }}
                    className="flex-1 rounded-xl overflow-hidden"
                    activeOpacity={0.7}
                  >
                    {isActive ? (
                      <LinearGradient colors={['#059669', '#047857']} className="py-3 items-center">
                        <Text className="text-white font-quicksand-semibold capitalize">{tab}s</Text>
                      </LinearGradient>
                    ) : (
                      <View className="py-3 items-center bg-gray-50">
                        <Text className="text-gray-600 font-quicksand-semibold capitalize">{tab}s</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="relative">
              <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                <Search size={18} color="#94A3B8" />
              </View>
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Recherche (nom, email, téléphone)"
                className="border border-gray-200 rounded-xl px-12 py-3 bg-gray-50 font-quicksand"
              />
            </View>
          </View>

          {/* Liste */}
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loadingList ? (
              <View className="p-8 items-center justify-center">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : (
              <View>
                {items.length === 0 ? (
                  <View className="p-8 items-center">
                    <Users size={48} color="#94A3B8" />
                    <Text className="p-4 text-gray-500 font-quicksand-medium">Aucun utilisateur trouvé.</Text>
                  </View>
                ) : (
                  <View>
                    {items.map((u, idx) => (
                      <View
                        key={u.id}
                        className={`px-5 py-4 ${idx < items.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-2">
                              <Text className="text-gray-900 font-quicksand-bold text-base">
                                {u.name ?? '(Sans nom)'}
                              </Text>
                              <View className="bg-gray-100 rounded-full px-2 py-0.5">
                                <Text className="text-xs text-gray-600 font-quicksand-semibold">#{u.id}</Text>
                              </View>
                            </View>
                            <View>
                              {u.phone && (
                                <View className="flex-row items-center gap-2 mb-1">
                                  <Phone size={14} color="#64748B" />
                                  <Text className="text-gray-700 font-quicksand text-sm">{u.phone}</Text>
                                </View>
                              )}
                              {u.email && (
                                <View className="flex-row items-center gap-2">
                                  <Mail size={14} color="#64748B" />
                                  <Text className="text-gray-700 font-quicksand text-sm">{u.email}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <View className={`px-3 py-1.5 rounded-full ${
                            u.role === 'admin' ? 'bg-purple-100' :
                            u.role === 'livreur' ? 'bg-blue-100' : 'bg-emerald-100'
                          }`}>
                            <View className="flex-row items-center gap-1">
                              <Shield size={12} color={
                                u.role === 'admin' ? '#8B5CF6' :
                                u.role === 'livreur' ? '#3B82F6' : '#059669'
                              } />
                              <Text className={`text-xs font-quicksand-bold capitalize ${
                                u.role === 'admin' ? 'text-purple-700' :
                                u.role === 'livreur' ? 'text-blue-700' : 'text-emerald-700'
                              }`}>
                                {u.role}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="flex-row justify-end mt-3 gap-3">
                          {u.role !== 'admin' && (
                            <>
                              <TouchableOpacity
                                onPress={() => onEditUser(u)}
                                className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200"
                                activeOpacity={0.7}
                              >
                                <Text className="text-emerald-700 font-quicksand-semibold text-xs">Modifier</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteUser(u)}
                                className="px-3 py-1 rounded-full bg-red-50 border border-red-200"
                                activeOpacity={0.7}
                              >
                                <Text className="text-red-600 font-quicksand-semibold text-xs">Supprimer</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {/* Pagination */}
                <View className="flex-row items-center justify-between p-4 border-t border-gray-100">
                  <Text className="text-gray-600 font-quicksand text-sm">
                    Page {page} / {pages} · {total} utilisateurs
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      disabled={page <= 1}
                      onPress={() => setPage((p) => Math.max(1, p - 1))}
                      className={`rounded-xl overflow-hidden ${page <= 1 ? 'opacity-50' : ''}`}
                      activeOpacity={0.7}
                    >
                      {page > 1 ? (
                        <LinearGradient colors={['#059669', '#047857']} className="px-4 py-2">
                          <View className="flex-row items-center gap-1">
                            <ChevronLeft size={16} color="#fff" />
                            <Text className="text-white font-quicksand-semibold text-sm">Précédent</Text>
                          </View>
                        </LinearGradient>
                      ) : (
                        <View className="px-4 py-2 bg-gray-100">
                          <View className="flex-row items-center gap-1">
                            <ChevronLeft size={16} color="#94A3B8" />
                            <Text className="text-gray-400 font-quicksand-semibold text-sm">Précédent</Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={page >= pages}
                      onPress={() => setPage((p) => Math.min(pages, p + 1))}
                      className={`rounded-xl overflow-hidden ${page >= pages ? 'opacity-50' : ''}`}
                      activeOpacity={0.7}
                    >
                      {page < pages ? (
                        <LinearGradient colors={['#059669', '#047857']} className="px-4 py-2">
                          <View className="flex-row items-center gap-1">
                            <Text className="text-white font-quicksand-semibold text-sm">Suivant</Text>
                            <ChevronRight size={16} color="#fff" />
                          </View>
                        </LinearGradient>
                      ) : (
                        <View className="px-4 py-2 bg-gray-100">
                          <View className="flex-row items-center gap-1">
                            <Text className="text-gray-400 font-quicksand-semibold text-sm">Suivant</Text>
                            <ChevronRight size={16} color="#94A3B8" />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
