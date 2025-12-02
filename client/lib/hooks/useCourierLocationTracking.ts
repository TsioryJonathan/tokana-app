import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { getApiClient } from '../api/client';
import { useToast } from '../../components/ui/Toast';

export function useCourierLocationTracking() {
  const api = getApiClient();
  const { showToast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    async function requestPermission() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLastError('Permission localisation refusée');
        showToast('Permission localisation refusée', 'error');
        setEnabled(false);
      }
    }
    if (enabled) {
      requestPermission();
    }
  }, [enabled, showToast]);

  useEffect(() => {
    async function sendOnce() {
      try {
        setIsSending(true);
        setLastError(null);
        const pos = await Location.getCurrentPositionAsync({});
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await api.request.request({
          method: 'PATCH',
          url: '/api/me/gps',
          body: { lat, lng },
          mediaType: 'application/json',
        } as any);
      } catch (e: any) {
        console.warn('[GPS] failed to send position', e);
        const msg: string = e?.body?.msg || e?.message || 'Envoi de position échoué';
        setLastError(msg);
      } finally {
        setIsSending(false);
      }
    }

    if (enabled) {
      // Envoi immédiat puis toutes les 60s
      sendOnce();
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        sendOnce();
      }, 60000) as unknown as number;
    } else {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, api]);

  return {
    enabled,
    setEnabled,
    isSending,
    lastError,
  };
}
