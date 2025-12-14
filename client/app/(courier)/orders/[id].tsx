import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getApiClient } from "../../../lib/api/client";
import { useAutoRefresh } from "../../../lib/hooks/useAutoRefresh";
import { useToast } from "../../../components/ui/Toast";
import {
  mapBackendOrderToUI,
  mapBackendStatus,
  statusLabel,
  statusBadge,
  type UIOrder,
  type OrderStatus,
} from "../../../lib/mappers/order";
import Row from "../../../components/CreateOrder/Row";

// Composant d'info badge
function InfoBadge({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-2">
      <Ionicons name={icon as any} size={16} color={color} />
      <View className="ml-2">
        <Text className="text-[10px] text-slate-500 font-quicksand-medium">{label}</Text>
        <Text className="text-xs font-quicksand-bold text-slate-900">{value}</Text>
      </View>
    </View>
  );
}

// Composant de bouton d'action
function ActionButton({
  label,
  icon,
  onPress,
  disabled,
  variant = "primary",
  subtitle,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled: boolean;
  variant?: "primary" | "success";
  subtitle?: string;
}) {
  const bgColor = disabled 
    ? "bg-slate-100" 
    : variant === "success" 
      ? "bg-emerald-600" 
      : "bg-blue-600";
  const textColor = disabled ? "text-slate-400" : "text-white";
  const iconColor = disabled ? "#94A3B8" : "#FFFFFF";

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
      className={`${bgColor} rounded-xl p-4 flex-row items-center`}
    >
      <Ionicons name={icon as any} size={22} color={iconColor} />
      <View className="flex-1 ml-3">
        <Text className={`font-quicksand-bold text-base ${textColor}`}>
          {label}
        </Text>
        {subtitle && (
          <Text className="text-xs text-slate-400 font-quicksand-medium mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={iconColor} />
    </TouchableOpacity>
  );
}

export default function CourierOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [order, setOrder] = useState<UIOrder | null>(null);
  const [rawOrder, setRawOrder] = useState<any | null>(null);
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
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeReason, setPostponeReason] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferReason, setTransferReason] = useState("");

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.orders.getApiOrders1(Number(id));

      setOrder(mapBackendOrderToUI(data));
      setRawOrder(data as any);
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

  const postponeOrderAction = async () => {
    if (!id || postponeReason.trim().length < 5) {
      showToast("Raison trop courte (min 5 caractères)", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.request.request({
        method: 'POST',
        url: `/api/courier/orders/${id}/postpone`,
        body: { reason: postponeReason.trim() },
        mediaType: 'application/json',
      } as any);
      showToast("Commande reportée", "success");
      setShowPostponeModal(false);
      setPostponeReason("");
      await reload();
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Erreur report";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const transferOrderAction = async () => {
    if (!id || !transferTargetId.trim()) {
      showToast("ID livreur requis", "error");
      return;
    }
    const targetId = parseInt(transferTargetId.trim(), 10);
    if (!Number.isFinite(targetId)) {
      showToast("ID livreur invalide", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.request.request({
        method: 'POST',
        url: `/api/courier/orders/${id}/transfer`,
        body: { targetCourierId: targetId, reason: transferReason.trim() || undefined },
        mediaType: 'application/json',
      } as any);
      showToast("Commande transférée", "success");
      setShowTransferModal(false);
      setTransferTargetId("");
      setTransferReason("");
      await reload();
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || "Erreur transfert";
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
  const canToExpedie = order.status === "IN_TRANSIT"; // Peut marquer expédié directement

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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Carte de statut améliorée */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-xs text-slate-500 font-quicksand-medium mb-1">Statut actuel</Text>
              <Text className="text-xl font-quicksand-bold text-emerald-600">
                {statusLabel[order.status]}
              </Text>
            </View>
            <View className={`px-4 py-2 rounded-full ${statusBadge[order.status]}`}>
              <Text className="text-xs font-quicksand-bold">
                {statusLabel[order.status]}
              </Text>
            </View>
          </View>
          
          <View className="flex-row flex-wrap gap-4 pt-4 border-t border-slate-100">
            <InfoBadge 
              icon="flash-outline" 
              label="Type" 
              value={order.service === "EXPRESS" ? "Express" : "Standard"}
              color={order.service === "EXPRESS" ? "#F59E0B" : "#6B7280"}
            />
            {order.service === "EXPRESS" && eta && (
              <InfoBadge 
                icon="time-outline" 
                label="ETA" 
                value={`${eta.min}–${eta.max} min`}
                color="#10B981"
              />
            )}
            {typeof order.priceAr === "number" && (
              <InfoBadge 
                icon="cash-outline" 
                label="Prix" 
                value={`${order.priceAr.toLocaleString()} Ar`}
                color="#3B82F6"
              />
            )}
            {typeof (order as any).cashToCollect === "number" && (order as any).cashToCollect > 0 && (
              <InfoBadge 
                icon="wallet-outline" 
                label="À encaisser" 
                value={`${(order as any).cashToCollect.toLocaleString()} Ar`}
                color="#8B5CF6"
              />
            )}
          </View>
        </View>

        {/* Actions améliorées */}
        <View className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <Text className="text-lg font-quicksand-bold text-slate-900 mb-4">
            Actions
          </Text>
          
          {/* Workflow de livraison en 4 étapes explicites */}
          <View className="mb-6">
            <Text className="text-sm text-slate-600 font-quicksand-medium mb-3">
              Workflow de livraison
            </Text>
            <View className="gap-3">
              <ActionButton
                label="1. En chemin pour récupération"
                subtitle="Vers l'expéditeur"
                icon="navigate-outline"
                onPress={() => updateStatus("en_route_vers_recuperation")}
                disabled={!canToPickup || submitting}
                variant="primary"
              />
              <ActionButton
                label="2. Récupéré"
                subtitle="Colis pris en charge"
                icon="cube-outline"
                onPress={() => updateStatus("en_chemin")}
                disabled={!canToEnChemin || submitting}
                variant="primary"
              />
              <ActionButton
                label="3. En chemin pour livraison"
                subtitle="Vers le destinataire"
                icon="bicycle-outline"
                onPress={() => updateStatus("en_chemin_pour_livraison")}
                disabled={!canToOutForDelivery || submitting}
                variant="primary"
              />
              <ActionButton
                label="4. Livré"
                subtitle="Mission terminée"
                icon="checkmark-circle-outline"
                onPress={() => updateStatus("expedie")}
                disabled={!canToExpedie || submitting}
                variant="success"
              />
            </View>
          </View>

          {/* Actions avancées */}
          {order.status !== 'DELIVERED' && (
            <View className="mt-6 pt-6 border-t border-slate-100">
              <Text className="text-sm text-slate-600 font-quicksand-medium mb-3">
                Actions avancées
              </Text>
              <View className="gap-3">
                <TouchableOpacity
                  onPress={() => setShowPostponeModal(true)}
                  disabled={submitting}
                  className="flex-row items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={20} color="#F59E0B" />
                    <Text className="ml-2 text-amber-700 font-quicksand-semibold text-sm">
                      Reporter la livraison
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTransferModal(true)}
                  disabled={submitting}
                  className="flex-row items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-3"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="swap-horizontal-outline" size={20} color="#A855F7" />
                    <Text className="ml-2 text-purple-700 font-quicksand-semibold text-sm">
                      Transférer à un autre livreur
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#A855F7" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Informations expéditeur */}
        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900 mb-3">
            Informations expéditeur
          </Text>
          {(() => {
            const p: any = rawOrder || {};
            return (
              <>
                {p.pickupName && <Row label="Nom" value={p.pickupName} />}
                {p.pickupPhone && <Row label="Téléphone" value={p.pickupPhone} />}
                <Row label="Adresse" value={p.pickupAddress || order?.from || '—'} multiline={true} />
                {p.pickupAddressDetail && (
                  <Row label="Détails" value={p.pickupAddressDetail} multiline={true} />
                )}
              </>
            );
          })()}
        </View>

        {/* Informations destinataire */}
        <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <Text className="text-base font-quicksand-bold text-slate-900 mb-3">
            Informations destinataire
          </Text>
          {(() => {
            const p: any = rawOrder || {};
            return (
              <>
                {p.dropoffName && <Row label="Nom" value={p.dropoffName} />}
                {p.recipientPhone && <Row label="Téléphone" value={p.recipientPhone} />}
                <Row label="Adresse" value={p.dropoffAddress || order?.to || '—'} multiline={true} />
                {p.dropoffAddressDetail && (
                  <Row label="Détails" value={p.dropoffAddressDetail} multiline={true} />
                )}
              </>
            );
          })()}
        </View>

        {/* Notes */}
        {(() => {
          const p: any = rawOrder || {};
          return p.notes && p.notes.trim() ? (
            <View className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <Text className="text-base font-quicksand-bold text-slate-900 mb-2">
                Notes
              </Text>
              <Text className="text-slate-700 text-sm">
                {p.notes}
              </Text>
            </View>
          ) : null;
        })()}

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

      {/* Modal Reporter */}
      <Modal
        visible={showPostponeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPostponeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-lg font-quicksand-bold text-slate-900 mb-4">
              Reporter la livraison
            </Text>
            <Text className="text-sm text-slate-600 font-quicksand mb-3">
              Indiquez la raison du report (min 5 caractères)
            </Text>
            <TextInput
              value={postponeReason}
              onChangeText={setPostponeReason}
              placeholder="Ex: Client absent, adresse incorrecte..."
              placeholderTextColor="#94A3B8"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 mb-4"
              multiline
              numberOfLines={3}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowPostponeModal(false);
                  setPostponeReason("");
                }}
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-slate-700 font-quicksand-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={postponeOrderAction}
                disabled={submitting || postponeReason.trim().length < 5}
                className={`flex-1 rounded-xl py-3 items-center ${
                  submitting || postponeReason.trim().length < 5 ? 'bg-slate-300' : 'bg-amber-600'
                }`}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-quicksand-semibold">Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Transférer */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-lg font-quicksand-bold text-slate-900 mb-4">
              Transférer la commande
            </Text>
            <Text className="text-sm text-slate-600 font-quicksand mb-3">
              ID du livreur cible
            </Text>
            <TextInput
              value={transferTargetId}
              onChangeText={setTransferTargetId}
              placeholder="Ex: 5"
              placeholderTextColor="#94A3B8"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 mb-3"
              keyboardType="number-pad"
            />
            <Text className="text-sm text-slate-600 font-quicksand mb-3">
              Raison (optionnel)
            </Text>
            <TextInput
              value={transferReason}
              onChangeText={setTransferReason}
              placeholder="Ex: Zone trop éloignée..."
              placeholderTextColor="#94A3B8"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 mb-4"
              multiline
              numberOfLines={2}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowTransferModal(false);
                  setTransferTargetId("");
                  setTransferReason("");
                }}
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-slate-700 font-quicksand-semibold">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={transferOrderAction}
                disabled={submitting || !transferTargetId.trim()}
                className={`flex-1 rounded-xl py-3 items-center ${
                  submitting || !transferTargetId.trim() ? 'bg-slate-300' : 'bg-purple-600'
                }`}
                activeOpacity={0.7}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-quicksand-semibold">Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
