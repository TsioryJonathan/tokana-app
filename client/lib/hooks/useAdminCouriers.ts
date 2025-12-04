import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

export interface AdminCourier {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  gpsEnabled: boolean;
  lastGpsLat: number | null;
  lastGpsLng: number | null;
  lastGpsAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    successRate: string;
  };
}

export interface CourierFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  gpsEnabled?: boolean;
}

export function useAdminCouriers() {
  const [couriers, setCouriers] = useState<AdminCourier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCouriers = useCallback(async (searchQuery?: string, gpsEnabledFilter?: boolean, pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const params: any = { page: pageNum, limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (gpsEnabledFilter !== undefined) params.gpsEnabled = gpsEnabledFilter.toString();

      const response = await api.request.request({
        method: 'GET',
        url: '/api/admin/couriers',
        query: params,
      });

      setCouriers(response.items || []);
      setTotal(response.total || 0);
      setPage(response.page || 1);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des livreurs';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourier = useCallback(async (id: number): Promise<AdminCourier | null> => {
    try {
      const api = getApiClient();
      const courier = await api.request.request({
        method: 'GET',
        url: `/api/admin/couriers/${id}`,
      });
      return courier as AdminCourier;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement du livreur';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return null;
    }
  }, []);

  const createCourier = useCallback(async (data: CourierFormData): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'POST',
        url: '/api/admin/couriers',
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Livreur créé avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la création du livreur';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const updateCourier = useCallback(async (id: number, data: Partial<CourierFormData>): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'PATCH',
        url: `/api/admin/couriers/${id}`,
        body: data,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Livreur modifié avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la modification du livreur';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const deleteCourier = useCallback(async (id: number): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'DELETE',
        url: `/api/admin/couriers/${id}`,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Livreur supprimé avec succès' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la suppression du livreur';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  const toggleGps = useCallback(async (id: number, enabled: boolean): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'PATCH',
        url: `/api/admin/couriers/${id}/gps`,
        body: { gpsEnabled: enabled },
      });
      Toast.show({ 
        type: 'success', 
        text1: 'Succès', 
        text2: `GPS ${enabled ? 'activé' : 'désactivé'} avec succès` 
      });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la modification du GPS';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  return {
    couriers,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchCouriers,
    getCourier,
    createCourier,
    updateCourier,
    deleteCourier,
    toggleGps,
  };
}
