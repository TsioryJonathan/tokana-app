import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { getApiClient } from '../../lib/api/client';
import type { User } from '../../lib/api/models/User';
import { useToast } from '../../components/ui/Toast';

export default function ProfileScreen() {
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await api.me.getApiMe();
        setMe(u);
      } catch (e: any) {
        showToast(e?.body?.msg || 'Impossible de charger votre profil', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const onPickAvatar = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*'], multiple: false, copyToCacheDirectory: false });
      // Handle cancel/new shapes
      const asset = (res as any)?.assets?.[0] || (res as any);
      if (!asset || (res as any)?.canceled) return;
      const uri: string | undefined = asset.uri;
      const name: string = asset.name || 'avatar.jpg';
      const type: string = asset.mimeType || 'image/jpeg';
      if (!uri) return;

      setUploading(true);
      // Convert picked file to Blob for the API client
      const fetched = await fetch(uri);
      const blob = await fetched.blob();
      // Ensure blob has a type
      const fileBlob: Blob = blob.type ? blob : new Blob([blob], { type });

      const resp = await api.me.postApiMeAvatar({ avatar: fileBlob });
      const newUrl = resp?.avatarUrl;
      if (newUrl) {
        setMe((prev) => ({ ...(prev || {}), avatarUrl: newUrl } as User));
        showToast('Photo de profil mise à jour', 'success');
      } else {
        showToast("Téléversement terminé, mais l'URL est manquante", 'info');
      }
    } catch (e: any) {
      const msg = e?.body?.msg || e?.message || 'Échec du téléversement';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top bar */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-quicksand-bold text-slate-900 flex-1">Mon profil</Text>
        <View style={{ width: 22, height: 22 }} />
      </View>

      <View className="flex-1 p-5">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#0F172A" />
            <Text className="mt-2 text-slate-600 text-[12px]">Chargement…</Text>
          </View>
        ) : (
          <>
            {/* Avatar */}
            <View className="items-center mt-6">
              {me?.avatarUrl ? (
                <Image
                  source={{ uri: me.avatarUrl }}
                  style={{ width: 112, height: 112, borderRadius: 9999 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-slate-200 items-center justify-center">
                  <Ionicons name="person-circle-outline" size={72} color="#64748B" />
                </View>
              )}
              <Text className="mt-3 text-[13px] text-slate-700">{me?.name || 'Utilisateur'}</Text>
              <Text className="text-[12px] text-slate-500">{me?.email || me?.phone || ''}</Text>
            </View>

            {/* Actions */}
            <View className="mt-8">
              <TouchableOpacity
                onPress={onPickAvatar}
                activeOpacity={0.9}
                disabled={uploading}
                className={`w-full px-5 py-3 rounded-full ${uploading ? 'bg-yellow-200' : 'bg-yellow-400'}`}
              >
                <View className="flex-row items-center justify-center">
                  {uploading ? (
                    <ActivityIndicator size="small" color="#0F172A" />
                  ) : (
                    <Ionicons name="image-outline" size={18} color="#0F172A" />
                  )}
                  <Text className="ml-2 text-slate-900 font-quicksand-bold">
                    {uploading ? 'Envoi…' : 'Changer la photo'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
