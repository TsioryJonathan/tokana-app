import React, { useMemo, useState } from 'react';
import PrimaryButton from './ui/PrimaryButton';
import { TokanaApiClient } from '@/app/lib/api';
import { clearSession, getAccessToken, getRefreshToken } from '@/app/lib/auth/session';

type Props = {
  title?: string;
  className?: string;
  textClassName?: string;
  onLoggedOut?: () => void;
};

export default function LogoutButton({ title = 'Logout', className, textClassName, onLoggedOut }: Props) {
  const [loading, setLoading] = useState(false);

  const api = useMemo(() => new TokanaApiClient({
    TOKEN: async () => (await getAccessToken()) ?? '',
  }), []);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const rt = await getRefreshToken();
      if (rt) {
        try {
          await api.auth.postApiAuthLogout({ refreshToken: rt });
        } catch (e) {
          // ignore network/api errors for logout flow, proceed to clear local session
          console.warn('logout api error', e);
        }
      }
    } finally {
      await clearSession();
      setLoading(false);
      onLoggedOut?.();
    }
  };

  return (
    <PrimaryButton
      onPress={handleLogout}
      loading={loading}
      accessibilityLabel="Logout"
      className={className}
      textClassName={textClassName}
    >
      {title}
    </PrimaryButton>
  );
}
