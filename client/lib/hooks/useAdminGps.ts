import { useState, useCallback } from 'react';
import { getApiClient } from '../api/client';
import Toast from 'react-native-toast-message';

export interface AdminGpsCourier {
  id: number;
  name: string;
  email: string;
  phone: string;
  gpsEnabled: boolean;
  lastGpsLat: number | null;
  lastGpsLng: number | null;
  lastGpsAt: string | null;
  stats?: {
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
  };
}

// Backend fields mapping
interface BackendGpsCourier {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  gpsTrackingEnabled: boolean;
  gpsLastLat: number | null;
  gpsLastLng: number | null;
  gpsLastSeenAt: string | null;
}

export function useAdminGps() {
  const [couriers, setCouriers] = useState<AdminGpsCourier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCouriers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const response: any = await api.request.request({
        method: 'GET',
        url: '/api/admin/gps/couriers',
      });

      // Map backend fields to frontend interface
      const items = (response.items || []).map((item: BackendGpsCourier) => ({
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        phone: item.phone || '',
        gpsEnabled: item.gpsTrackingEnabled,
        lastGpsLat: item.gpsLastLat,
        lastGpsLng: item.gpsLastLng,
        lastGpsAt: item.gpsLastSeenAt,
      }));

      setCouriers(items);
    } catch (err: any) {
      const msg = err?.body?.msg || 'Erreur lors du chargement des positions GPS';
      setError(msg);
      Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    couriers,
    loading,
    error,
    fetchCouriers,
  };
}
