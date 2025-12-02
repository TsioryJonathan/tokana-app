import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../api/client';
import { useToast } from '../../components/ui/Toast';

interface EveningItem {
  id: number;
  createdBy?: number;
  assignedTo?: number;
  status: string;
  cashToCollect?: number;
  priceTotal: number;
  isPrepaid: boolean;
  deliveryFeePrepaid: boolean;
  courierCollected: number;
  clientNet: number;
  adminNet: number;
  deliveryFee: number;
  caseType: number;
}

interface EveningTotals {
  totalOrders: number;
  totalCourierCollected: number;
  totalClientNet: number;
  totalAdminNet: number;
  totalDeliveryFees: number;
}

interface Settlement {
  courierId: number;
  date: string;
  status: 'DECLARED' | 'CONFIRMED';
  cashAmount?: number;
  mobileMoneyAmount?: number;
  declaredAt?: string;
  confirmedAt?: string;
}

interface EveningResponse {
  date: string;
  courierId: number;
  totals: EveningTotals;
  items: EveningItem[];
  settlement?: Settlement | null;
}

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useCourierEveningSettlement(initialDate?: string) {
  const api = getApiClient();
  const { showToast } = useToast();

  const [date, setDate] = useState(initialDate || todayISODate());
  const [data, setData] = useState<EveningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cashAmount, setCashAmount] = useState('');
  const [mobileMoneyAmount, setMobileMoneyAmount] = useState('');
  const [declaring, setDeclaring] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.request.request({
        method: 'GET',
        url: '/api/courier/settlements/evening',
        query: { date },
      } as any);
      setData(res as EveningResponse);
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement du bilan échoué';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [date, api, showToast]);

  const declareSettlement = useCallback(async () => {
    try {
      setDeclaring(true);
      setError(null);

      const cashNum = cashAmount.trim() ? parseInt(cashAmount.trim(), 10) : 0;
      const mmNum = mobileMoneyAmount.trim() ? parseInt(mobileMoneyAmount.trim(), 10) : 0;

      const payload = {
        date,
        cashAmount: Number.isFinite(cashNum) ? cashNum : 0,
        mobileMoneyAmount: Number.isFinite(mmNum) ? mmNum : 0,
      };

      await api.request.request({
        method: 'POST',
        url: '/api/courier/settlements/evening/declare',
        body: payload,
        mediaType: 'application/json',
      } as any);

      showToast('Règlement déclaré avec succès', 'success');
      await load();
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Déclaration du règlement échouée';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setDeclaring(false);
    }
  }, [date, cashAmount, mobileMoneyAmount, api, load, showToast]);

  const summary = useMemo<EveningTotals | null>(() => {
    if (!data) return null;
    return data.totals;
  }, [data]);

  return {
    date,
    setDate,
    data,
    loading,
    error,
    summary,
    cashAmount,
    setCashAmount,
    mobileMoneyAmount,
    setMobileMoneyAmount,
    declaring,
    load,
    declareSettlement,
  };
}
