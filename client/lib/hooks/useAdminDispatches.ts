import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import Toast from 'react-native-toast-message';

export interface AdminDispatch {
  id: number;
  clientId: number;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  courierId: number;
  courierName: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  netAmount: number;
  cashAmount: number | null;
  mobileMoneyAmount: number | null;
  createdAt: string;
  updatedAt: string;
  orders?: Array<{
    id: number;
    status: string;
    cashToCollect: number;
    priceTotal: number;
    isPrepaid: boolean;
    deliveryFeePrepaid: boolean;
    clientNet: number;
  }>;
}

export function useAdminDispatches() {
  const [dispatches, setDispatches] = useState<AdminDispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDispatches = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const params: any = {};
      if (status) params.status = status;

      const response: any = await api.request.request({
        method: 'GET',
        url: '/api/admin/dispatches',
        query: params,
      });

      setDispatches(response.items || []);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des dispatches';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dispatches,
    loading,
    error,
    fetchDispatches,
  };
}
