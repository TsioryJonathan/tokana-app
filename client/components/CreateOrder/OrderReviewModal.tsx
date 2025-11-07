import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { SenderState, RecipientState, ParcelState, ServiceState, PaymentState } from '../../types/createorder.type';
import type { LocalityItem } from '../../lib/hooks/useLocalities';

export default function OrderReviewModal({
  visible,
  onClose,
  onConfirm,
  sender,
  recipient,
  parcel,
  service,
  payment,
  pickupLocality,
  dropoffLocality,
  zoneLevel,
  priceTotal,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sender: SenderState;
  recipient: RecipientState;
  parcel: ParcelState;
  service: ServiceState;
  payment: PaymentState;
  pickupLocality: LocalityItem | null;
  dropoffLocality: LocalityItem | null;
  zoneLevel: 'ville' | 'peripherie' | 'super-peripherie';
  priceTotal?: number | null;
}) {
  const zoneLabel = zoneLevel === 'ville' ? 'TANA-VILLE' : zoneLevel === 'peripherie' ? 'PÉRIPHÉRIE' : 'SUPER-PÉRIPHÉRIE';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="w-full bg-white rounded-t-2xl p-4 max-h-[85%]">
          <Text className="text-lg font-quicksand-bold text-slate-900 mb-2">Vérifier et confirmer</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <View className="mb-3">
              <Text className="text-[12px] text-slate-500">Zone</Text>
              <Text className="text-[13px] text-slate-900">{zoneLabel}</Text>
              <Text className="mt-1 text-[12px] text-slate-500">Total</Text>
              <Text className="text-[13px] text-slate-900">{priceTotal != null ? `${priceTotal} Ar` : '—'}</Text>
              <Text className="mt-1 text-[12px] text-slate-500">Service</Text>
              <Text className="text-[13px] text-slate-900">{service.service === 'EXPRESS' ? 'Express' : 'Standard'} · Retour: {service.needReturn ? 'Oui' : 'Non'}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-[12px] text-slate-500">Colis</Text>
              <Text className="text-[13px] text-slate-900">{parcel.category} · {parcel.weightKg || '—'} kg · x{parcel.parcelsCount || '1'} · {parcel.fragile ? 'Fragile' : 'Non fragile'} · {parcel.bulky ? 'Volumineux' : 'Non volumineux'}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-[12px] text-slate-500">Expéditeur</Text>
              <Text className="text-[13px] text-slate-900">{sender.name} · {sender.phone}</Text>
              <Text className="text-[12px] text-slate-900">{sender.address}</Text>
              <Text className="text-[12px] text-slate-500">{pickupLocality?.name || '—'}</Text>
            </View>

            <View className="mb-3">
              <Text className="text-[12px] text-slate-500">Destinataire</Text>
              <Text className="text-[13px] text-slate-900">{recipient.name} · {recipient.phone}{recipient.email ? ` · ${recipient.email}` : ''}</Text>
              <Text className="text-[12px] text-slate-900">{recipient.address}</Text>
              <Text className="text-[12px] text-slate-500">{dropoffLocality?.name || '—'}</Text>
            </View>

            <View className="mb-2">
              <Text className="text-[12px] text-slate-500">Paiement</Text>
              <Text className="text-[13px] text-slate-900">Encaissement: {payment.codAmountAr || '0'} Ar</Text>
              {payment.notes ? (
                <Text className="text-[12px] text-slate-700">Notes: {payment.notes}</Text>
              ) : null}
            </View>
          </ScrollView>
          <View className="mt-2 flex-row">
            <TouchableOpacity onPress={onClose} activeOpacity={0.9} className="flex-1 mr-2 px-4 py-3 rounded-xl bg-slate-200">
              <Text className="text-center text-slate-800 font-quicksand-bold">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} activeOpacity={0.9} className="flex-1 ml-2 px-4 py-3 rounded-xl bg-emerald-600">
              <Text className="text-center text-white font-quicksand-bold">Confirmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
