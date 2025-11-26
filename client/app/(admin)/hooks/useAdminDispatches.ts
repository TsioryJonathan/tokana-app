import { useCallback, useMemo, useState } from 'react';
import { getApiClient } from '../../../lib/api/client';
import type { AdminClientPendingDispatchItem } from '../../../lib/api/models/AdminClientPendingDispatchItem';
import type { AdminDispatch } from '../../../lib/api/models/AdminDispatch';
import { useToast } from '../../../components/ui/Toast';

export function useAdminDispatches() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [pendingClients, setPendingClients] = useState<AdminClientPendingDispatchItem[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [errorPending, setErrorPending] = useState<string | null>(null);

  const [dispatches, setDispatches] = useState<AdminDispatch[]>([]);
  const [loadingDispatches, setLoadingDispatches] = useState(false);
  const [errorDispatches, setErrorDispatches] = useState<string | null>(null);

  const [creatingClientId, setCreatingClientId] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    setErrorPending(null);
    try {
      const res = await api.adminDispatches.getApiAdminDispatchesPendingClients();
      const items = res.items ?? [];
      const filtered = items.filter((it) => (it.netClient ?? 0) !== 0);
      setPendingClients(filtered);
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement des clients à régler échoué';
      setErrorPending(msg);
      showToast(msg, 'error');
    } finally {
      setLoadingPending(false);
    }
  }, [api, showToast]);

  const loadDispatches = useCallback(async () => {
    setLoadingDispatches(true);
    setErrorDispatches(null);
    try {
      const res = await api.adminDispatches.getApiAdminDispatches();
      setDispatches(res);
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement des dispatches échoué';
      setErrorDispatches(msg);
    } finally {
      setLoadingDispatches(false);
    }
  }, [api]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPending(), loadDispatches()]);
  }, [loadPending, loadDispatches]);

  const createDispatch = useCallback(
    async (clientId: number, courierRaw: string) => {
      const trimmed = courierRaw.trim();
      if (!trimmed) {
        showToast('Renseignez un ID de livreur', 'error');
        return;
      }
      const courierIdNum = Number(trimmed);
      if (!Number.isFinite(courierIdNum)) {
        showToast("ID livreur invalide", 'error');
        return;
      }
      const client = pendingClients.find((c) => c.clientId === clientId);
      if (!client) {
        showToast('Client introuvable dans la liste à régler', 'error');
        return;
      }
      const net = client.netClient ?? 0;
      const orders = client.orders ?? [];
      const orderIds = orders.map((o) => o.id).filter((id): id is number => typeof id === 'number');
      if (orderIds.length === 0) {
        showToast("Aucune livraison à inclure dans le dispatch", 'error');
        return;
      }
      const cashAmount = net;
      const mobileMoneyAmount = 0;
      setCreatingClientId(clientId);
      try {
        await api.adminDispatches.postApiAdminDispatches({
          clientId: clientId,
          courierId: courierIdNum,
          orderIds,
          cashAmount,
          mobileMoneyAmount,
        });
        showToast('Dispatch créé', 'success');
        await refreshAll();
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Création du dispatch échouée';
        showToast(msg, 'error');
      } finally {
        setCreatingClientId(null);
      }
    },
    [api, pendingClients, refreshAll, showToast]
  );

  return {
    pendingClients,
    loadingPending,
    errorPending,
    dispatches,
    loadingDispatches,
    errorDispatches,
    creatingClientId,
    loadPending,
    loadDispatches,
    refreshAll,
    createDispatch,
  };
}
