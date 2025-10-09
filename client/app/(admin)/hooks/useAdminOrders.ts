import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import type { Order } from '@/lib/api/models/Order';
import type { OrderStatus } from '@/lib/mappers/order';

export type OrdersFilterTab = 'assigned' | 'unassigned';
export type ServiceFilterTab = 'all' | 'standard' | 'express';
export type DateFilterTab = 'all' | 'today' | 'week';

export function useAdminOrders() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assignInputs, setAssignInputs] = useState<Record<number, string>>({});
  const [assignBusy, setAssignBusy] = useState<Record<number, boolean>>({});
  const [statusBusy, setStatusBusy] = useState<Record<number, boolean>>({});
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<OrdersFilterTab>('assigned');
  const [serviceTab, setServiceTab] = useState<ServiceFilterTab>('express');
  const [dateTab, setDateTab] = useState<DateFilterTab>('all');

  // Load saved filters on mount
  useEffect(() => {
    (async () => {
      try {
        const [f, s, d] = await Promise.all([
          AsyncStorage.getItem('adminOrders.filterTab'),
          AsyncStorage.getItem('adminOrders.serviceTab'),
          AsyncStorage.getItem('adminOrders.dateTab'),
        ]);
        if (f === 'assigned' || f === 'unassigned') setFilterTab(f);
        if (s === 'all' || s === 'standard' || s === 'express') setServiceTab(s as ServiceFilterTab);
        if (d === 'all' || d === 'today' || d === 'week') setDateTab(d as DateFilterTab);
      } catch {}
    })();
  }, []);

  // Persist filters on change
  useEffect(() => {
    AsyncStorage.setItem('adminOrders.filterTab', filterTab).catch(() => {});
  }, [filterTab]);
  useEffect(() => {
    AsyncStorage.setItem('adminOrders.serviceTab', serviceTab).catch(() => {});
  }, [serviceTab]);
  useEffect(() => {
    AsyncStorage.setItem('adminOrders.dateTab', dateTab).catch(() => {});
  }, [dateTab]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.orders.getApiOrders();
      setOrders(list);
      setLastUpdatedISO(new Date().toISOString());
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[useAdminOrders] load error', e?.body || e?.message || e);
      showToast('Chargement des commandes échoué', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const setAssignInput = useCallback((id: number, v: string) => {
    setAssignInputs((m) => ({ ...m, [id]: v }));
  }, []);

  const setBusyAssign = useCallback((id: number, busy: boolean) => {
    setAssignBusy((m) => ({ ...m, [id]: busy }));
  }, []);

  const assign = useCallback(async (orderId: number) => {
    const raw = assignInputs[orderId]?.trim();
    if (!raw) { showToast('Renseignez un ID ou un nom de livreur', 'error'); return; }

    // Try numeric ID first
    const asNum = Number(raw);
    const numeric = !Number.isNaN(asNum) ? asNum : null;

    setBusyAssign(orderId, true);
    try {
      let targetId: number | null = numeric;
      if (targetId == null) {
        const res = await api.adminUsers.getApiAdminUsers('livreur', raw, 1, 5);
        const items = res.items ?? [];
        const exact = items.filter(u => (u.name ?? '').toLowerCase() === raw.toLowerCase());
        if (exact.length === 1) targetId = exact[0].id as number;
        else if (items.length === 1) targetId = items[0].id as number;
        else if (items.length > 1) { showToast(`Plusieurs livreurs trouvés pour "${raw}". Affinez la recherche.`, 'error'); return; }
        else { showToast(`Aucun livreur trouvé pour "${raw}"`, 'error'); return; }
      }
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: targetId });
      showToast('Commande assignée', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[useAdminOrders] assign error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Assignation échouée';
      showToast(msg, 'error');
    } finally {
      setBusyAssign(orderId, false);
    }
  }, [api, assignInputs, load, setBusyAssign, showToast]);

  const unassign = useCallback(async (orderId: number) => {
    setBusyAssign(orderId, true);
    try {
      await api.orders.patchApiOrdersAssign(orderId, { assignedTo: null });
      showToast('Assignation retirée', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[useAdminOrders] unassign error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Désassignation échouée';
      showToast(msg, 'error');
    } finally {
      setBusyAssign(orderId, false);
    }
  }, [api, load, setBusyAssign, showToast]);

  const backendStatusByUi: Partial<Record<OrderStatus, string>> = {
    CREATED: 'en_cours_de_traitement',
    PICKED_UP: 'en_route_vers_recuperation',
    IN_TRANSIT: 'en_chemin',
    DELIVERED: 'expedie',
  };

  const updateStatusBackend = useCallback(async (orderId: number, backendStatus: string) => {
    setStatusBusy((m) => ({ ...m, [orderId]: true }));
    try {
      await api.orders.patchApiOrdersStatus(orderId, { status: backendStatus });
      showToast('Statut mis à jour', 'success');
      await load();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[useAdminOrders] status update error', e?.body || e?.message || e);
      const msg: string = e?.body?.msg || e?.message || 'Mise à jour du statut échouée';
      showToast(msg, 'error');
    } finally {
      setStatusBusy((m) => ({ ...m, [orderId]: false }));
    }
  }, [api, load, showToast]);

  const updateStatus = useCallback((orderId: number, uiStatus: OrderStatus) => {
    const backend = backendStatusByUi[uiStatus];
    if (!backend) return;
    return updateStatusBackend(orderId, backend);
  }, [updateStatusBackend]);

  const filteredOrders = useMemo(() => {
    // 1) Assign filter
    const byAssign = orders.filter(o => filterTab === 'assigned' ? o.assignedTo != null : o.assignedTo == null);
    // 2) Service filter
    const byService = (() => {
      if (serviceTab === 'all') return byAssign;
      const isExpress = serviceTab === 'express';
      return byAssign.filter(o => String(o.type) === (isExpress ? 'express' : 'standard'));
    })();
    // 3) Date filter (based on createdAt when available)
    if (dateTab === 'all') {
      // Sort: Express first, then by createdAt desc
      return [...byService].sort((a, b) => {
        const ax = String(a.type) === 'express' ? 0 : 1;
        const bx = String(b.type) === 'express' ? 0 : 1;
        if (ax !== bx) return ax - bx;
        const ta = new Date(String((a as any).createdAt)).getTime();
        const tb = new Date(String((b as any).createdAt)).getTime();
        const va = Number.isFinite(ta) ? ta : -Infinity;
        const vb = Number.isFinite(tb) ? tb : -Infinity;
        return vb - va;
      });
    }
    const now = new Date();
    let start: Date;
    let end: Date;
    if (dateTab === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    } else {
      // week: from last Sunday 00:00 to now
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const day = d.getDay(); // 0=Sunday
      start = new Date(d);
      start.setDate(d.getDate() - day);
      end = now;
    }
    const inRange = (iso?: any) => {
      if (!iso) return false;
      const t = new Date(String(iso)).getTime();
      return Number.isFinite(t) && t >= start.getTime() && t < end.getTime();
    };
    const ranged = byService.filter(o => inRange((o as any).createdAt));
    return ranged.sort((a, b) => {
      const ax = String(a.type) === 'express' ? 0 : 1;
      const bx = String(b.type) === 'express' ? 0 : 1;
      if (ax !== bx) return ax - bx;
      const ta = new Date(String((a as any).createdAt)).getTime();
      const tb = new Date(String((b as any).createdAt)).getTime();
      const va = Number.isFinite(ta) ? ta : -Infinity;
      const vb = Number.isFinite(tb) ? tb : -Infinity;
      return vb - va;
    });
  }, [orders, filterTab, serviceTab, dateTab]);

  // Badge counts for tabs (contextual with other active filters)
  const counts = useMemo(() => {
    // Helper: in-range function for dateTab
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    if (dateTab !== 'all') {
      if (dateTab === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      } else {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const day = d.getDay();
        start = new Date(d);
        start.setDate(d.getDate() - day);
        end = now;
      }
    }
    const inDate = (o: Order) => {
      if (!start || !end) return true;
      const t = new Date(String((o as any).createdAt)).getTime();
      return Number.isFinite(t) && t >= start.getTime() && t < end.getTime();
    };
    // Apply date filter first
    const byDate = orders.filter(inDate);
    // Base set for assign/service interactions
    const baseByService = serviceTab === 'all'
      ? byDate
      : byDate.filter(o => String(o.type) === (serviceTab === 'express' ? 'express' : 'standard'));
    const forAssign = baseByService;
    const assignedCount = forAssign.filter(o => o.assignedTo != null).length;
    const unassignedCount = forAssign.filter(o => o.assignedTo == null).length;
    // Counts for service tabs considering selected assign tab
    const forService = byDate.filter(o => (filterTab === 'assigned' ? o.assignedTo != null : o.assignedTo == null));
    const allCount = forService.length;
    const standardCount = forService.filter(o => String(o.type) === 'standard').length;
    const expressCount = forService.filter(o => String(o.type) === 'express').length;
    // Counts for date tabs considering selected assign and service tabs
    const baseByAssign = orders.filter(o => (filterTab === 'assigned' ? o.assignedTo != null : o.assignedTo == null));
    const baseByAssignService = serviceTab === 'all'
      ? baseByAssign
      : baseByAssign.filter(o => String(o.type) === (serviceTab === 'express' ? 'express' : 'standard'));
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const day = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - day);
    const startOfWeekTs = startOfWeek.getTime();
    const todayCount = baseByAssignService.filter(o => {
      const t = new Date(String((o as any).createdAt)).getTime();
      return Number.isFinite(t) && t >= startOfToday && t < startOfTomorrow;
    }).length;
    const weekCount = baseByAssignService.filter(o => {
      const t = new Date(String((o as any).createdAt)).getTime();
      return Number.isFinite(t) && t >= startOfWeekTs && t <= now.getTime();
    }).length;
    return {
      assignedCount,
      unassignedCount,
      service: { all: allCount, standard: standardCount, express: expressCount },
      date: { all: baseByAssignService.length, today: todayCount, week: weekCount },
    };
  }, [orders, filterTab, serviceTab, dateTab]);

  return {
    // data
    orders,
    filteredOrders,
    loading,
    refreshing,
    lastUpdatedISO,
    // filters
    filterTab,
    setFilterTab,
    dateTab,
    setDateTab,
    serviceTab,
    setServiceTab,
    counts,
    // assign inputs/busy
    assignInputs,
    setAssignInput,
    assignBusy,
    statusBusy,
    // actions
    load,
    onRefresh,
    assign,
    unassign,
    updateStatus,
    updateStatusBackend,
  };
}
