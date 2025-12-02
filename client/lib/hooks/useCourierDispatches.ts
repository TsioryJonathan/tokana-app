import { useCallback, useState } from 'react';
import { getApiClient } from '../api/client';
import { useToast } from '../../components/ui/Toast';

interface DispatchOrder {
  id: number;
  status: string;
  cashToCollect?: number;
  priceTotal: number;
  isPrepaid: boolean;
  deliveryFeePrepaid: boolean;
  clientNet: number;
}

interface CourierDispatch {
  id: number;
  clientId: number;
  clientName?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;
  courierId: number;
  status: 'WAITING_COURIER' | 'IN_PROGRESS' | 'COMPLETED';
  netAmount: number;
  cashAmount: number;
  mobileMoneyAmount: number;
  createdAt: string;
  updatedAt: string;
  orders: DispatchOrder[];
}

export function useCourierDispatches() {
  const api = getApiClient();
  const { showToast } = useToast();

  const [dispatches, setDispatches] = useState<CourierDispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(
    async (status?: 'WAITING_COURIER' | 'IN_PROGRESS' | 'COMPLETED') => {
      try {
        setLoading(true);
        setError(null);
        const query: any = {};
        if (status) query.status = status;
        const res = await api.request.request({
          method: 'GET',
          url: '/api/courier/dispatches',
          query,
        } as any);
        setDispatches((res as any).items || []);
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Chargement des dispatches échoué';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    },
    [api, showToast]
  );

  const updateStatus = useCallback(
    async (dispatchId: number, newStatus: 'IN_PROGRESS' | 'COMPLETED') => {
      try {
        setUpdatingId(dispatchId);
        setError(null);
        await api.request.request({
          method: 'PATCH',
          url: `/api/courier/dispatches/${dispatchId}/status`,
          body: { status: newStatus },
          mediaType: 'application/json',
        } as any);
        showToast('Statut mis à jour', 'success');
        await load();
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Mise à jour du statut échouée';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setUpdatingId(null);
      }
    },
    [api, load, showToast]
  );

  return {
    dispatches,
    loading,
    error,
    updatingId,
    load,
    updateStatus,
  };
}
