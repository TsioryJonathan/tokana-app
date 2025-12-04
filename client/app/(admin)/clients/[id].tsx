import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminClients, AdminClient } from '../../../lib/hooks/useAdminClients';

export default function AdminClientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getClient, deleteClient } = useAdminClients();
  const [client, setClient] = useState<AdminClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getClient(parseInt(id, 10));
    setClient(data);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer le client "${client?.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            const success = await deleteClient(parseInt(id, 10));
            if (success) {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!client) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-slate-700 font-quicksand-semibold mt-3">Client introuvable</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-quicksand-bold text-slate-900">Détail Client</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push(`/(admin)/clients/edit/${id}` as any)}
            className="bg-blue-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-red-600 p-2 rounded-xl"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Informations principales */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">
            INFORMATIONS
          </Text>

          <View className="gap-3">
            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Nom</Text>
              <Text className="text-base text-slate-900 font-quicksand-semibold">
                {client.name}
              </Text>
            </View>

            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Email</Text>
              <Text className="text-base text-slate-900 font-quicksand">{client.email}</Text>
            </View>

            <View>
              <Text className="text-xs text-slate-500 font-quicksand mb-1">Téléphone</Text>
              <Text className="text-base text-slate-900 font-quicksand">{client.phone}</Text>
            </View>

            {client.zone && (
              <View>
                <Text className="text-xs text-slate-500 font-quicksand mb-1">Zone</Text>
                <View className="bg-emerald-100 px-3 py-1.5 rounded-lg self-start">
                  <Text className="text-sm font-quicksand-semibold text-emerald-700">
                    {client.zone}
                  </Text>
                </View>
              </View>
            )}

            {client.address && (
              <View>
                <Text className="text-xs text-slate-500 font-quicksand mb-1">Adresse</Text>
                <Text className="text-base text-slate-900 font-quicksand">{client.address}</Text>
              </View>
            )}

            {client.notes && (
              <View>
                <Text className="text-xs text-slate-500 font-quicksand mb-1">Notes</Text>
                <View className="bg-amber-50 p-3 rounded-lg">
                  <Text className="text-sm text-amber-900 font-quicksand">{client.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Statut */}
        <View className="bg-white rounded-2xl p-4 mb-3">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">STATUT</Text>

          <View className="flex-row items-center">
            <Ionicons
              name={client.emailVerifiedAt ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={client.emailVerifiedAt ? '#059669' : '#EF4444'}
            />
            <Text className="text-sm text-slate-900 font-quicksand ml-2">
              Email {client.emailVerifiedAt ? 'vérifié' : 'non vérifié'}
            </Text>
          </View>
        </View>

        {/* Dates */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-sm text-slate-500 font-quicksand-semibold mb-3">DATES</Text>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-600 font-quicksand">Créé le</Text>
              <Text className="text-sm text-slate-900 font-quicksand-semibold">
                {new Date(client.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-600 font-quicksand">Modifié le</Text>
              <Text className="text-sm text-slate-900 font-quicksand-semibold">
                {new Date(client.updatedAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
