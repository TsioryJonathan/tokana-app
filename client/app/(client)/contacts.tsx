import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSavedContacts, SavedContact } from '../../lib/hooks/useSavedContacts';
import { useToast } from '../../components/ui/Toast';

export default function ContactsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { contacts, loading, fetchContacts, deleteContact, updateContact } = useSavedContacts();
  
  const [activeTab, setActiveTab] = useState<'sender' | 'recipient'>('sender');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  };

  const handleDelete = (contact: SavedContact) => {
    Alert.alert(
      'Supprimer le contact',
      `Voulez-vous vraiment supprimer ${contact.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteContact(contact.id);
            if (success) {
              await fetchContacts();
            }
          },
        },
      ]
    );
  };

  const handleToggleDefault = async (contact: SavedContact) => {
    const success = await updateContact(contact.id, { isDefault: !contact.isDefault });
    if (success) {
      await fetchContacts();
    }
  };

  // Filtrer les contacts
  const filteredContacts = contacts
    .filter((c) => c.type === activeTab)
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Par défaut en premier
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-xl font-quicksand-bold text-slate-900">
              Mes contacts
            </Text>
          </View>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-slate-100 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un contact..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-sm text-slate-900 font-quicksand"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab('sender')}
            activeOpacity={0.7}
            className={`flex-1 px-4 py-2 rounded-full ${
              activeTab === 'sender' ? 'bg-[#FFD700]' : 'bg-slate-200'
            }`}
          >
            <Text
              className={`text-center text-sm font-quicksand-semibold ${
                activeTab === 'sender' ? 'text-slate-900' : 'text-slate-600'
              }`}
            >
              Expéditeurs ({contacts.filter((c) => c.type === 'sender').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('recipient')}
            activeOpacity={0.7}
            className={`flex-1 px-4 py-2 rounded-full ${
              activeTab === 'recipient' ? 'bg-[#FFD700]' : 'bg-slate-200'
            }`}
          >
            <Text
              className={`text-center text-sm font-quicksand-semibold ${
                activeTab === 'recipient' ? 'text-slate-900' : 'text-slate-600'
              }`}
            >
              Destinataires ({contacts.filter((c) => c.type === 'recipient').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des contacts */}
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading && !refreshing ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : filteredContacts.length === 0 ? (
          <View className="py-12 items-center px-6">
            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-500 font-quicksand mt-3 text-center">
              {searchQuery
                ? 'Aucun contact trouvé'
                : `Aucun ${activeTab === 'sender' ? 'expéditeur' : 'destinataire'} sauvegardé`}
            </Text>
          </View>
        ) : (
          <View className="p-4 gap-3">
            {filteredContacts.map((contact) => (
              <View
                key={contact.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm"
              >
                {/* Header avec nom et actions */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-quicksand-bold text-slate-900">
                        {contact.name}
                      </Text>
                      {contact.isDefault && (
                        <View className="bg-[#FFD700] px-2 py-0.5 rounded-full">
                          <Text className="text-xs font-quicksand-bold text-slate-900">
                            Par défaut
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleToggleDefault(contact)}
                      activeOpacity={0.7}
                      className="p-2"
                    >
                      <Ionicons
                        name={contact.isDefault ? 'star' : 'star-outline'}
                        size={20}
                        color={contact.isDefault ? '#FFD700' : '#64748B'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(contact)}
                      activeOpacity={0.7}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Informations */}
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="call-outline" size={14} color="#64748B" />
                    <Text className="text-sm text-slate-600 font-quicksand">
                      {contact.phone}
                    </Text>
                  </View>

                  {contact.email && (
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="mail-outline" size={14} color="#64748B" />
                      <Text className="text-sm text-slate-600 font-quicksand">
                        {contact.email}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-start gap-2">
                    <Ionicons name="location-outline" size={14} color="#64748B" className="mt-0.5" />
                    <Text className="text-sm text-slate-600 font-quicksand flex-1">
                      {contact.address}
                      {contact.addressDetail && ` - ${contact.addressDetail}`}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
