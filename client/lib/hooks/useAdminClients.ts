import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export interface AdminClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  zone: string | null;
  address: string | null;
  notes: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  zone?: string;
  address?: string;
  notes?: string;
}

export function useAdminClients() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClients = useCallback(async (searchQuery?: string, zoneFilter?: string, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const params: any = { page: pageNum, limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (zoneFilter) params.zone = zoneFilter;

      const response = await api.request.request({
        method: 'GET',
        url: '/api/admin/clients',
        query: params,
      });

      setClients(response.items || []);
      setTotal(response.total || 0);
      setPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des clients';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  const getClient = useCallback(async (id: number): Promise<AdminClient | null> => {
    try {
      const api = getApiClient();
      const client = await api.request.request({
        method: 'GET',
        url: `/api/admin/clients/${id}`,
      });
      return client as AdminClient;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement du client';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return null;
    }
  }, []);

  const createClient = useCallback(async (data: ClientFormData): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'POST',
        url: '/api/admin/clients',
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Client créé avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la création du client';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const updateClient = useCallback(async (id: number, data: Partial<ClientFormData>): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'PATCH',
        url: `/api/admin/clients/${id}`,
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Client modifié avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la modification du client';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'DELETE',
        url: `/api/admin/clients/${id}`,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Client supprimé avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la suppression du client';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
  };
}
