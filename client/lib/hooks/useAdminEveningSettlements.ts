import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import Toast from 'react-native-toast-message';

export interface AdminSettlement {
  id: number;
  courierId: number;
  courierName: string;
  date: string;
  status: 'DECLARED' | 'CONFIRMED';
  cashAmount: number | null;
  mobileMoneyAmount: number | null;
  declaredAt: string | null;
  confirmedAt: string | null;
}

export function useAdminEveningSettlements() {
  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlements = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const params: any = {};
      if (date) params.date = date;

      const response = await api.request.request({
        method: 'GET',
        url: '/api/admin/settlements/list',
        query: params,
      });

      setSettlements(response.items || []);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des règlements';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmSettlement = useCallback(async (settlementId: number): Promise<boolean> => {
    try {
      const api = getApiClient();
      await api.request.request({
        method: 'POST',
        url: `/api/admin/settlements/evening/${settlementId}/confirm`,
      });
      Toast.show({ type: 'success', text1: 'Succès', text2: 'Règlement confirmé' });
      return true;
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors de la confirmation';
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      return false;
    }
  }, []);

  return {
    settlements,
    loading,
    error,
    fetchSettlements,
    confirmSettlement,
  };
}
