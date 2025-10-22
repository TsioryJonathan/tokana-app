import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';

export type MobileMoney = 'MVOLA' | 'AIRTEL' | 'ORANGE';

const mgPhoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;

export function useProfile() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [phoneVerifiedAt, setPhoneVerifiedAt] = useState<string | null>(null);
  const [emailVerifiedAt, setEmailVerifiedAt] = useState<string | null>(null);

  // Minimal addresses used for count in UI
  const [addresses, setAddresses] = useState<
    { id: string; label: string; detail: string }[]
  >([]);

  const canSave = useMemo(
    () =>
      name.trim().length > 1 &&
      (phone.trim() === '' || mgPhoneRegex.test(phone.trim())) &&
      (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) || email.trim() === ''),
    [name, phone, email]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.me.getApiMe();
        if (!mounted) return;
        setName(me.name || '');
        setPhone(me.phone || '');
        setEmail(me.email || '');
        setRole(me.role || null);
        // Optional verification statuses (if provided by backend)
        setPhoneVerifiedAt((me as any).phoneVerifiedAt || null);
        setEmailVerifiedAt((me as any).emailVerifiedAt || null);
      } catch (e) {
        console.warn('/api/me failed', e);
        showToast("Impossible de charger le profil", 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  // Load user's saved addresses from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Prefer generated SDK if available, fallback to low-level request until SDK is regenerated
        let rows: any;
        if ((api as any).addresses?.getApiAddresses) {
          rows = await (api as any).addresses.getApiAddresses();
        } else {
          rows = await (api as any).request.request({ method: 'GET', url: '/api/addresses' });
        }
        if (!mounted) return;
        const list = Array.isArray(rows)
          ? rows.map((r) => ({ id: String(r.id), label: r.label ?? '', detail: r.detail ?? '' }))
          : [];
        setAddresses(list);
      } catch (e) {
        console.warn('load addresses failed', e);
        // Non-bloquant pour l'écran profil; on garde la liste vide
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  const onSaveProfile = async () => {
    if (!canSave) {
      showToast('Vérifie tes informations', 'error');
      return;
    }
    // TODO: implement API update and avatar upload
    showToast('Mise à jour du profil bientôt disponible', 'info');
  };

  const pickAvatar = async () => {
    try {
      // Dynamic import to avoid bundling error when package isn't installed
      const ImagePicker: any = await import('expo-image-picker').catch(() => null);
      if (!ImagePicker) {
        showToast('Module image-picker non installé (réseau).', 'error');
        return;
      }

      const ensureFn = (fnName: string) =>
        ImagePicker && typeof ImagePicker[fnName] === 'function';

      const chooseFromGallery = async () => {
        if (!ensureFn('requestMediaLibraryPermissionsAsync') || !ensureFn('launchImageLibraryAsync') || !ImagePicker.MediaTypeOptions) {
          showToast("expo-image-picker indisponible/incompatible. Réessaie après l'installation.", 'error');
          return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showToast('Permission galerie refusée', 'error');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!res.canceled && res.assets?.length) {
          setAvatarUrl(res.assets[0].uri);
        }
      };

      const takeWithCamera = async () => {
        if (!ensureFn('requestCameraPermissionsAsync') || !ensureFn('launchCameraAsync')) {
          showToast("expo-image-picker indisponible/incompatible. Réessaie après l'installation.", 'error');
          return;
        }
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showToast('Permission caméra refusée', 'error');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!res.canceled && res.assets?.length) {
          setAvatarUrl(res.assets[0].uri);
        }
      };

      Alert.alert('Photo de profil', 'Choisir une source', [
        { text: 'Caméra', onPress: takeWithCamera },
        { text: 'Galerie', onPress: chooseFromGallery },
        { text: 'Annuler', style: 'cancel' },
      ]);
    } catch (e) {
      console.warn('pick avatar failed', e);
      showToast("Impossible d'ouvrir le sélecteur", 'error');
    }
  };

  return {
    // state
    loading,
    editing,
    avatarUrl,
    name,
    phone,
    email,
    role,
    phoneVerifiedAt,
    emailVerifiedAt,
    addresses,
    canSave,

    // setters
    setEditing,
    setName,
    setPhone,
    setEmail,

    // actions
    pickAvatar,
    onSaveProfile,
  };
}
