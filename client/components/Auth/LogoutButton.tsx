import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import PrimaryButton from "../ui/PrimaryButton";
import { TokanaApiClient } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
} from "@/lib/auth/session";
import { getApiClient } from "@/lib/api/client";

type Props = {
  title?: string;
  className?: string;
  textClassName?: string;
  onLoggedOut?: () => void;
  confirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
};

export default function LogoutButton({
  title = "Logout",
  className,
  textClassName,
  onLoggedOut,
  confirm = false,
  confirmTitle = "Déconnexion",
  confirmMessage = "Voulez-vous vous déconnecter ?",
}: Props) {
  const [loading, setLoading] = useState(false);

  const api = useMemo(getApiClient, []);

  const doLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const rt = await getRefreshToken();

      if (rt) {
        try {
          await api.auth.postApiAuthLogout({ refreshToken: rt });
        } catch (e) {
          // ignore network/api errors for logout flow, proceed to clear local session
          console.warn("logout api error", e);
        }
      }
    } finally {
      await clearSession();
      setLoading(false);
      onLoggedOut?.();
    }
  };

  const handlePress = () => {
    if (!confirm) {
      void doLogout();
      return;
    }
    Alert.alert(confirmTitle, confirmMessage, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: () => {
          void doLogout();
        },
      },
    ]);
  };

  return (
    <PrimaryButton
      onPress={handlePress}
      loading={loading}
      accessibilityLabel="Logout"
      className={className}
      textClassName={textClassName}
    >
      {title}
    </PrimaryButton>
  );
}
