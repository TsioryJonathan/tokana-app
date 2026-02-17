import { useEffect, useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getApiClient, getApiBase } from '../lib/api/client';
import { getAccessToken } from '../lib/auth/session';
import { useToast } from '../components/ui/Toast';

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

  // Snapshot to detect changes
  const [initialProfile, setInitialProfile] = useState({ name: '', phone: '', email: '', addressDetail: '', addressId: null as string | null });

  // Minimal addresses used for count in UI
  const [addresses, setAddresses] = useState<
    { id: string; label: string; detail: string; mapboxAddress?: string | null; lat?: number | null; lng?: number | null; isDefault?: boolean }[]
  >([]);
  const [addressEdit, setAddressEdit] = useState('');
  const [addressEditId, setAddressEditId] = useState<string | null>(null);

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
        setAvatarUrl(me.avatarUrl || null);
        setPhoneVerifiedAt(me.phoneVerifiedAt || null);
        setEmailVerifiedAt(me.emailVerifiedAt || null);
        setInitialProfile({ name: me.name || '', phone: me.phone || '', email: me.email || '', addressDetail: '', addressId: null });
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

  // Auto-refresh on screen focus: keep avatarUrl and addresses in sync
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          if (editing) return; // do not override while user is editing
          const [me, rows] = await Promise.all([
            api.me.getApiMe().catch(() => null),
            api.addresses.getApiAddresses().catch(() => [] as any[]),
          ]);
          if (!active) return;
          if (me) {
            setAvatarUrl(me.avatarUrl || null);
          }
          if (Array.isArray(rows)) {
            const list = rows.map((r) => ({ id: String(r.id), label: r.label ?? '', detail: r.detail ?? '', mapboxAddress: r.mapboxAddress ?? null, lat: r.lat != null ? Number(r.lat) : null, lng: r.lng != null ? Number(r.lng) : null, isDefault: !!r.isDefault }));
            setAddresses(list);
            const first = list[0] || null;
            setAddressEdit(first?.detail ?? '');
            setAddressEditId(first ? first.id : null);
            setInitialProfile(prev => ({ ...prev, addressDetail: first?.detail ?? '', addressId: first ? first.id : null }));
          }
        } catch (e) {
          // non-bloquant
          console.warn('focus refresh failed', e);
        }
      })();
      return () => { active = false; };
    }, [editing, api])
  );

  const isDirty = useMemo(
    () => name !== initialProfile.name || phone !== initialProfile.phone || email !== initialProfile.email || addressEdit !== initialProfile.addressDetail,
    [name, phone, email, addressEdit, initialProfile]
  );

  const isAdmin = useMemo(() => role === 'admin', [role]);

  // Load user's saved addresses from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await api.addresses.getApiAddresses();
        if (!mounted) return;
        const list = Array.isArray(rows)
          ? rows.map((r) => ({ id: String(r.id), label: r.label ?? '', detail: r.detail ?? '', mapboxAddress: r.mapboxAddress ?? null, lat: r.lat != null ? Number(r.lat) : null, lng: r.lng != null ? Number(r.lng) : null, isDefault: !!r.isDefault }))
          : [];
        setAddresses(list);
        const first = list[0] || null;
        setAddressEdit(first?.detail ?? '');
        setAddressEditId(first ? first.id : null);
        setInitialProfile(prev => ({ ...prev, addressDetail: first?.detail ?? '', addressId: first ? first.id : null }));
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
    if (!isDirty) {
      showToast('Aucun changement à enregistrer', 'info');
      return;
    }
    // Persist name/phone/email
    try {
      await api.me.putApiMe({ name, email, phone });
    } catch (e) {
      console.warn('put /api/me failed', e);
      showToast("Impossible d'enregistrer le profil", 'error');
      return;
    }

    // Addresses: create or update a SINGLE managed address (first entry), then refresh list
    try {
      const managed = addresses[0] || null;
      if (managed) {
        if (addressEdit !== initialProfile.addressDetail) {
          const body = { label: managed.label || 'Adresse', detail: addressEdit };
          await api.addresses.putApiAddresses(Number(managed.id), body);
        }
      } else if (addressEdit.trim()) {
        const body = { label: 'Adresse', detail: addressEdit };
        await api.addresses.postApiAddresses(body);
      }
      // Re-fetch authoritative list and reset local state from server
      const fresh = await api.addresses.getApiAddresses();
      const normalized = Array.isArray(fresh)
        ? fresh.map((r) => ({ id: String(r.id), label: r.label ?? '', detail: r.detail ?? '', isDefault: !!r.isDefault }))
        : [];
      setAddresses(normalized);
      const first = normalized[0] || null;
      setAddressEdit(first?.detail ?? '');
      setAddressEditId(first ? first.id : null);
      // Update snapshot to new authoritative value
      setInitialProfile({ name, phone, email, addressDetail: first?.detail ?? '', addressId: first ? first.id : null });
    } catch (e) {
      console.warn('save address failed', e);
      showToast("Impossible de sauvegarder l'adresse", 'error');
      return;
    }

    // Exit edit mode and notify
    setEditing(false);
    showToast('Profil mis à jour', 'success');
  };

  // Revert unsaved changes and exit edit mode
  const resetProfile = () => {
    setName(initialProfile.name);
    setPhone(initialProfile.phone);
    setEmail(initialProfile.email);
    setAddressEdit(initialProfile.addressDetail);
    setAddressEditId(initialProfile.addressId);
    setEditing(false);
  };

  const pickAvatar = async () => {
    try {
      // Dynamic import to avoid bundling error when package isn't installed
      const DocumentPicker: any = await import('expo-document-picker').catch(() => null);
      if (!DocumentPicker || typeof DocumentPicker.getDocumentAsync !== 'function') {
        showToast('Sélecteur de document indisponible. Installe expo-document-picker.', 'error');
        return;
      }

      const res: any = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (!res) return;

      // Handle both new (canceled/assets) and old (type/uri) API shapes
      if (res.canceled) return;
      let asset: any | null = null;
      if (Array.isArray(res.assets) && res.assets.length) {
        asset = res.assets[0];
      } else if (res.type === 'success') {
        asset = res; // old shape: { type: 'success', uri, name, size, mimeType }
      }
      if (!asset?.uri) {
        showToast('Aucun fichier sélectionné', 'info');
        return;
      }
      
      // Afficher l'aperçu immédiatement
      setAvatarUrl(asset.uri);
      showToast('Téléchargement de la photo...', 'info');
      
      // Upload avatar to server
      // Utiliser fetch directement car le client API généré ne gère pas bien les fichiers React Native
      try {
        const token = await getAccessToken();
        if (!token) {
          showToast('Non authentifié', 'error');
          return;
        }
        
        const formData = new FormData();
        // Format React Native pour FormData
        formData.append('avatar', {
          uri: asset.uri,
          name: asset.name || 'avatar.jpg',
          type: asset.mimeType || 'image/jpeg',
        } as any);
        
        // Récupérer l'URL de base de l'API
        const apiBase = getApiBase() || 'https://tokana-app.onrender.com';
        const response = await fetch(`${apiBase}/api/me/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Ne pas définir Content-Type, laissez fetch le faire automatiquement pour FormData
          },
          body: formData as any,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ msg: 'Erreur serveur' }));
          throw new Error(errorData.msg || `Erreur ${response.status}`);
        }
        
        const uploaded = await response.json();
        if (uploaded?.avatarUrl) {
          setAvatarUrl(uploaded.avatarUrl);
          showToast('Photo de profil mise à jour', 'success');
        } else {
          showToast('Photo téléchargée mais URL non reçue', 'warning');
        }
      } catch (e: any) {
        console.warn('upload avatar failed', e);
        const errorMsg = e?.message || 'Erreur de téléchargement';
        showToast(`Échec: ${errorMsg}`, 'error');
        // Garder l'aperçu local même si l'upload échoue
      }
    } catch (e: any) {
      console.warn('pick avatar failed', e);
      const errorMsg = e?.message || "Impossible d'ouvrir le sélecteur";
      showToast(errorMsg, 'error');
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
    addressEdit,
    canSave,
    isDirty,
    isAdmin,

    // setters
    setEditing,
    setName,
    setPhone,
    setEmail,
    setAddressEdit,

    // actions
    pickAvatar,
    onSaveProfile,
    resetProfile,
  };
}
