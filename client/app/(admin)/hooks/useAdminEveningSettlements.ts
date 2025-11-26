import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../../lib/api/client';

type EveningItem = {
  id: number;
  createdBy?: number | null;
  assignedTo?: number | null;
  status: string;
  cashToCollect?: number | null;
  priceTotal: number;
  isPrepaid: boolean;
  deliveryFeePrepaid: boolean;
  courierCollected: number;
  clientNet: number;
  adminNet: number;
  deliveryFee: number;
  caseType: number;
};

type EveningSettlementMeta = {
  courierId: number;
  date: string;
  status: 'DECLARED' | 'CONFIRMED';
  cashAmount?: number | null;
  mobileMoneyAmount?: number | null;
  declaredAt?: string | null;
  confirmedAt?: string | null;
};

export type EveningTotals = {
  totalOrders: number;
  totalCourierCollected: number;
  totalClientNet: number;
  totalAdminNet: number;
  totalDeliveryFees: number;
};

export type EveningResponse = {
  date: string;
  courierId: number | null;
  totals: EveningTotals;
  items: EveningItem[];
   settlement?: EveningSettlementMeta | null;
};

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useAdminEveningSettlements(initialDate?: string) {
  const [date, setDate] = useState(initialDate || todayISODate());
  const [courierIdInput, setCourierIdInput] = useState('');
  const [data, setData] = useState<EveningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const trimmed = courierIdInput.trim();
      const idNum = trimmed ? Number(trimmed) : undefined;
      const res = await (api as any).adminSettlements.getApiAdminSettlementsEvening(date, Number.isFinite(idNum as number) ? (idNum as number) : undefined);
      setData(res as EveningResponse);
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement du règlement échoué';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [date, courierIdInput]);

  const confirm = useCallback(async () => {
    const trimmed = courierIdInput.trim();
    if (!trimmed) {
      setError('Renseignez un ID de livreur pour confirmer le règlement');
      return;
    }
    const courierIdNum = Number(trimmed);
    if (!Number.isFinite(courierIdNum)) {
      setError('ID livreur invalide');
      return;
    }
    try {
      setConfirming(true);
      setError(null);
      const api = getApiClient();
      const payload: any = {
        date,
        courierId: courierIdNum,
      };
      if (data?.totals?.totalCourierCollected != null) {
        payload.cashAmount = data.totals.totalCourierCollected;
        payload.mobileMoneyAmount = 0;
      }
      await (api as any).adminSettlements.postApiAdminSettlementsEveningConfirm(payload);
      await load();
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Confirmation du règlement échouée';
      setError(msg);
    } finally {
      setConfirming(false);
    }
  }, [courierIdInput, date, data, load]);

  const summary = useMemo<EveningTotals | null>(() => {
    if (!data) return null;
    return data.totals;
  }, [data]);

  return {
    date,
    setDate,
    courierIdInput,
    setCourierIdInput,
    data,
    loading,
    error,
    summary,
    load,
    confirming,
    confirm,
  };
}
