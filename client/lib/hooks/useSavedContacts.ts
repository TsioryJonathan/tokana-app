import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import Toast from 'react-native-toast-message';

export interface SavedContact {
  id: number;
  userId: number;
  type: 'sender' | 'recipient';
  name: string;
  phone: string;
  address: string;
  addressDetail?: string | null;
  email?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedContactFormData {
  type: 'sender' | 'recipient';
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  email?: string;
  isDefault?: boolean;
}

export function useSavedContacts() {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (type?: 'sender' | 'recipient') => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const params: any = {};
      if (type) params.type = type;

      const response: any = await api.request.request({
        method: 'GET',
        url: '/api/saved-contacts',
        query: params,
      });

      setContacts(response.items || []);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des contacts';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  const createContact = useCallback(async (data: SavedContactFormData): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'POST',
        url: '/api/saved-contacts',
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Contact sauvegardé' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la sauvegarde du contact';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const updateContact = useCallback(async (id: number, data: Partial<SavedContactFormData>): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'PATCH',
        url: `/api/saved-contacts/${id}`,
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Contact modifié' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la modification du contact';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const deleteContact = useCallback(async (id: number): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'DELETE',
        url: `/api/saved-contacts/${id}`,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Contact supprimé' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la suppression du contact';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
}
