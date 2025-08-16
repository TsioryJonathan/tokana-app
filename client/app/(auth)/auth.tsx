// app/(auth)/auth.tsx
import React, { useMemo } from "react";
import AuthScreen from "@/components/AuthScreen";
import { useLocalSearchParams } from "expo-router";

export default function Auth() {
  const params = useLocalSearchParams<{ q?: string | string[] }>();

  const q = useMemo(() => {
    const v = params.q;
    return Array.isArray(v) ? v[0] : v;
  }, [params.q]);

  return <AuthScreen q={q} />;
}
