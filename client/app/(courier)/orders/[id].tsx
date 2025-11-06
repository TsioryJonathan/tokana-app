import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "@/lib/api/client";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useToast } from "@/components/ui/Toast";
import {
  mapBackendOrderToUI,
  mapBackendStatus,
  statusLabel,
  type UIOrder,
  type OrderStatus,
} from "@/lib/mappers/order";
import { OTPRequest } from "@/lib/api/models/OTPRequest";

export default function CourierOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [order, setOrder] = useState<UIOrder | null>(null);
  const [history, setHistory] = useState<
    { id: number; from?: OrderStatus | null; to: OrderStatus; at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eta, setEta] = useState<{ min: number; max: number } | null>(null);
  const [remarks, setRemarks] = useState<
    { id: number; text: string; createdAt: string; createdBy?: number | null }[]
  >([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [newRemark, setNewRemark] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isOutForDelivery, setIsOutForDelivery] = useState(false);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.orders.getApiOrders1(Number(id));

      setOrder(mapBackendOrderToUI(data));
      setIsOutForDelivery(
        String((data as any).status) === "en_chemin_pour_livraison"
      );
      setOtpVerified(Boolean((data as any).deliveryOtpVerifiedAt));
      const h = await api.orders.getApiOrdersHistory(Number(id));
      const mapped = (h || [])
        .map((it) => ({
          id: Number(it.id || 0),
          from: it.fromStatus ? mapBackendStatus(it.fromStatus) : null,
          to: mapBackendStatus(String(it.toStatus || "")),
          at: String((it as any).createdAt || ""),
        }))
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      setHistory(mapped);
    } catch (e) {
      console.warn("[courier order] load error", e);
      showToast("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  }, [api, id, showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Auto-refresh every 2 minutes
  useAutoRefresh(reload, 2 * 60 * 1000, true);

  const loadEtaIfExpress = useCallback(
    async (svc: UIOrder["service"]) => {
      if (svc !== "EXPRESS") {
        setEta(null);
        return;
      }
      try {
        const avail = await api.slots.getApiSlotsExpress();
        const min = avail?.eta?.minMinutes;
        const max = avail?.eta?.maxMinutes;
        if (typeof min === "number" && typeof max === "number")
          setEta({ min, max });
        else setEta({ min: 60, max: 120 });
      } catch {
        // silent
      }
    },
    [api.slots]
  );

  const loadRemarks = useCallback(async () => {
    if (!id) return;
    setLoadingRemarks(true);
    try {
      const data = await api.orders.getApiOrdersRemarks(Number(id));
      const mapped = (Array.isArray(data) ? data : []).map((r, idx) => ({
        id: typeof r.id === "number" ? r.id : idx,
        text: String(r.text || ""),
        createdAt: r.createdAt ? String(r.createdAt) : new Date().toISOString(),
        createdBy:
          typeof r.createdBy === "number" || r.createdBy === null
            ? r.createdBy
            : null,
      }));
      setRemarks(mapped);
    } catch (e) {
      // optional toast, keep quiet for MVP
    } finally {
      setLoadingRemarks(false);
    }
  }, [api.orders, id]);

  useEffect(() => {
    if (order) {
      loadEtaIfExpress(order.service);
      loadRemarks();
    }
  }, [order, loadEtaIfExpress, loadRemarks]);

  // Auto-refresh ETA for Express orders every 2 minutes while mounted
  useEffect(() => {
    let timer: any;
    if (order?.service === "EXPRESS") {
      const refresh = () => loadEtaIfExpress("EXPRESS");
      timer = setInterval(refresh, 2 * 60 * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [order?.service, loadEtaIfExpress]);

  const updateStatus = async (
    next:
      | "en_route_vers_recuperation"
      | "en_chemin"
      | "en_chemin_pour_livraison"
      | "expedie"
  ) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.orders.patchApiOrdersStatus(Number(id), { status: next });
      showToast("Statut mis à jour", "success");
      await reload();
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Erreur statut";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const addRemark = async () => {
    if (!id) return;
    const text = newRemark.trim();
    if (text.length < 2) return;
    setSubmitting(true);
    try {
      await api.orders.postApiOrdersRemarks(Number(id), { text });
      setNewRemark("");
      await loadRemarks();
      showToast("Remarque ajoutée", "success");
    } catch (err: any) {
      showToast(err?.message || "Erreur remarque", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const requestOtp = async (channel: OTPRequest["channel"]) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await api.deliveryOtp.postApiOrdersRequestOtp(Number(id), { channel });
      showToast(`OTP ${channel} envoyé`, "success");
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Erreur OTP";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!id) return;
    const code = otpCode.trim();
    if (!/^\d{6}$/.test(code)) {
      showToast("Code OTP invalide (6 chiffres)", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.deliveryOtp.postApiOrdersVerifyOtp(Number(id), { code });
      showToast("OTP vérifié, vous pouvez marquer expédié", "success");
      setOtpCode("");
      setOtpVerified(true);
      await reload();
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Erreur OTP";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !order) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-slate-600">Chargement…</Text>
      </View>
    );
  }

  const canToPickup = order.status === "CREATED";
  const canToEnChemin =
    order.status === "PICKED_UP" || order.status === "CREATED";
  const canToOutForDelivery =
    order.status === "IN_TRANSIT" || order.status === "PICKED_UP";
  const canToExpedie = order.status === "IN_TRANSIT"; // côté API: nécessite OTP vérifié

  const handleBack = () => {
    router.replace('/(courier)' as any);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-slate-200">
        <TouchableOpacity 
          onPress={handleBack} 
          activeOpacity={0.7}
          className="flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-2"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text className="text-slate-900 font-quicksand-semibold">Retour</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-lg font-quicksand-bold text-slate-900">
            Course #{order.code}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm">Statut actuel</Text>
          <Text className="mt-1 text-base font-quicksand-bold text-emerald-600">
            {statusLabel[order.status]}
          </Text>
          <Text className="mt-2 text-slate-600 text-sm">
            Type: {order.service === "EXPRESS" ? "Express" : "Standard"}
          </Text>
          {order.service === "EXPRESS" && eta && (
            <Text className="text-[12px] text-emerald-700 mt-1">
              ETA: {eta.min}–{eta.max} min
            </Text>
          )}
          {typeof order.priceAr === "number" ? (
            <Text className="text-slate-600 text-sm">
              Prix: {order.priceAr.toLocaleString()} Ar
            </Text>
          ) : null}
          {typeof (order as any).cashToCollect === "number" ? (
            <Text className="text-slate-600 text-sm">
              À encaisser: {(order as any).cashToCollect.toLocaleString()} Ar
            </Text>
          ) : null}
          <Text className="mt-1 text-[12px] text-slate-500">
            OTP: {otpVerified ? "Vérifié" : "Non vérifié"}
          </Text>
        </View>

        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900">
            Actions
          </Text>
          <View className="mt-3 gap-8">
            <View>
              <Text className="text-slate-700 font-quicksand-semibold">
                Transitions
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-8">
                <TouchableOpacity
                  disabled={!canToPickup || submitting}
                  onPress={() => updateStatus("en_route_vers_recuperation")}
                >
                  <Text
                    className={`${canToPickup && !submitting ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                  >
                    Aller récupérer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!canToEnChemin || submitting}
                  onPress={() => updateStatus("en_chemin")}
                >
                  <Text
                    className={`${canToEnChemin && !submitting ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                  >
                    En chemin
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!canToOutForDelivery || submitting}
                  onPress={() => updateStatus("en_chemin_pour_livraison")}
                >
                  <Text
                    className={`${canToOutForDelivery && !submitting ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                  >
                    En chemin pour la livraison
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!canToExpedie || submitting || !otpVerified}
                  onPress={() => updateStatus("expedie")}
                >
                  <Text
                    className={`${canToExpedie && !submitting && otpVerified ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                  >
                    Expédié
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isOutForDelivery && (
              <View>
                <Text className="text-slate-700 font-quicksand-semibold">
                  OTP Livraison
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-8">
                  <TouchableOpacity
                    disabled={submitting}
                    onPress={() => requestOtp(OTPRequest.channel.SMS)}
                  >
                    <Text
                      className={`${!submitting ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                    >
                      Demander OTP (SMS)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={submitting}
                    onPress={() => requestOtp(OTPRequest.channel.EMAIL)}
                  >
                    <Text
                      className={`${!submitting ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                    >
                      Demander OTP (Email)
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="mt-3">
                  <Text className="text-slate-600 text-sm">Code OTP</Text>
                  <TextInput
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="ex: 123456"
                    keyboardType="number-pad"
                    className="mt-1 border border-slate-200 rounded-xl px-3 py-2 text-[14px] text-slate-900"
                  />
                  <View className="mt-2 flex-row gap-8">
                    <TouchableOpacity
                      disabled={submitting || !/^\d{6}$/.test(otpCode)}
                      onPress={verifyOtp}
                    >
                      <Text
                        className={`${!submitting && /^\d{6}$/.test(otpCode) ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                      >
                        Vérifier OTP
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-[12px] text-slate-500 mt-2">
                  L’OTP est disponible au statut “En chemin pour la livraison”.{" "}
                  {otpVerified
                    ? "OTP vérifié."
                    : "Vérifiez l’OTP pour activer “Expédié”."}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900">
            Remarques
          </Text>
          {loadingRemarks ? (
            <Text className="mt-2 text-slate-500 text-sm">Chargement…</Text>
          ) : (
            <View className="mt-2">
              {remarks.length === 0 ? (
                <Text className="text-slate-500 text-sm">Aucune remarque.</Text>
              ) : (
                remarks.map((r, idx) => (
                  <View
                    key={`${r.id}-${idx}`}
                    className="py-2 border-b border-slate-100"
                  >
                    <Text className="text-[13px] text-slate-800">{r.text}</Text>
                    <Text className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
          <View className="mt-3">
            <TextInput
              value={newRemark}
              onChangeText={setNewRemark}
              placeholder="Ajouter une remarque (ex: client absent, colis endommagé)"
              placeholderTextColor="#94A3B8"
              className="border border-slate-200 rounded-xl px-3 py-2 text-[14px] text-slate-900"
              multiline
            />
            <View className="mt-2 flex-row justify-end">
              <TouchableOpacity
                disabled={submitting || newRemark.trim().length < 2}
                onPress={addRemark}
              >
                <Text
                  className={`${!submitting && newRemark.trim().length >= 2 ? "text-emerald-700" : "text-slate-400"} font-quicksand-semibold`}
                >
                  Envoyer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900">
            Historique
          </Text>
          {history.length === 0 ? (
            <Text className="mt-2 text-slate-500 text-sm">
              Aucun historique disponible.
            </Text>
          ) : (
            <View className="mt-2">
              {history.map((h, idx) => (
                <View
                  key={`${h.id}-${idx}`}
                  className="flex-row items-start py-2 border-b border-slate-100"
                >
                  <View className="mt-1 mr-3">
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-quicksand-semibold text-slate-800">
                      {statusLabel[h.to]}
                    </Text>
                    <Text className="text-[12px] text-slate-500">
                      {new Date(h.at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
