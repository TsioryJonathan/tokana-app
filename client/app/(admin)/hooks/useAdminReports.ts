import { useCallback, useState } from 'react';
import { getApiClient } from '../../../lib/api/client';
import type { AdminClientReport } from '../../../lib/api/models/AdminClientReport';
import type { AdminHistoryReport } from '../../../lib/api/models/AdminHistoryReport';
import { useToast } from '../../../components/ui/Toast';

export type HistoryPreset = 'today' | '7d' | '30d' | 'all';

function computePresetRange(preset: HistoryPreset): { dateFrom?: string; dateTo?: string } {
  if (preset === 'all') {
    return {};
  }
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  if (preset === 'today') {
    start.setHours(0, 0, 0, 0);
  } else if (preset === '7d') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (preset === '30d') {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }
  return {
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
  };
}

export function useAdminReports() {
  const { showToast } = useToast();

  const [clientReport, setClientReport] = useState<AdminClientReport | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [errorClient, setErrorClient] = useState<string | null>(null);

  const [history, setHistory] = useState<AdminHistoryReport | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);
  const [historyPreset, setHistoryPreset] = useState<HistoryPreset>('7d');

  const loadClientReport = useCallback(
    async (clientId: number, dateFrom?: string, dateTo?: string) => {
      setLoadingClient(true);
      setErrorClient(null);
      try {
        const api = getApiClient();
        const data = await api.adminReports.getApiAdminReportsClient(clientId, dateFrom, dateTo);
        setClientReport(data);
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Chargement du rapport client échoué';
        setErrorClient(msg);
        showToast(msg, 'error');
      } finally {
        setLoadingClient(false);
      }
    },
    [showToast]
  );

  const loadHistory = useCallback(
    async (preset?: HistoryPreset) => {
      const effective = preset || historyPreset;
      setHistoryPreset(effective);
      setLoadingHistory(true);
      setErrorHistory(null);
      try {
        const api = getApiClient();
        const range = computePresetRange(effective);
        const data = await api.adminReports.getApiAdminReportsHistory(range.dateFrom, range.dateTo);
        setHistory(data);
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Chargement de l\'historique échoué';
        setErrorHistory(msg);
        showToast(msg, 'error');
      } finally {
        setLoadingHistory(false);
      }
    },
    [historyPreset, showToast]
  );

  return {
    clientReport,
    loadingClient,
    errorClient,
    history,
    loadingHistory,
    errorHistory,
    historyPreset,
    setHistoryPreset,
    loadClientReport,
    loadHistory,
  };
}
