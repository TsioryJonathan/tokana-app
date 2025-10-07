import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { OTPRequest } from '@/lib/api';
import { getApiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';

export default function DeliveryPage() {
  const api = useMemo(getApiClient, []);
  const { showToast } = useToast();

  const [orderId, setOrderId] = useState('');
  const [channel, setChannel] = useState<OTPRequest.channel>(OTPRequest.channel.SMS);
  const [code, setCode] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const requestOtp = async () => {
    const id = Number(orderId);
    if (!id) {
      showToast('Order ID invalide', 'error');
      return;
    }
    setLoadingReq(true);
    try {
      await api.deliveryOtp.postApiOrdersRequestOtp(id, { channel });
      showToast('Code OTP envoyé', 'success');
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || 'Erreur';
      showToast(msg, 'error');
    } finally {
      setLoadingReq(false);
    }
  };

  const verifyOtp = async () => {
    const id = Number(orderId);
    if (!id) {
      showToast('Order ID invalide', 'error');
      return;
    }
    setLoadingVerify(true);
    try {
      await api.deliveryOtp.postApiOrdersVerifyOtp(id, { code });
      showToast('Livraison confirmée', 'success');
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || 'Erreur';
      showToast(msg, 'error');
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Livreur — OTP livraison</Text>

      <Text>Order ID</Text>
      <TextInput value={orderId} onChangeText={setOrderId} placeholder="ex: 123" keyboardType="numeric" />

      <Text>Canal (sms/email)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={`sms${channel === OTPRequest.channel.SMS ? ' (actif)' : ''}`} onPress={() => setChannel(OTPRequest.channel.SMS)} />
        <Button title={`email${channel === OTPRequest.channel.EMAIL ? ' (actif)' : ''}`} onPress={() => setChannel(OTPRequest.channel.EMAIL)} />
      </View>

      <Button title={loadingReq ? 'Envoi...' : 'Demander OTP'} onPress={requestOtp} disabled={loadingReq || !orderId} />

      <Text>Code</Text>
      <TextInput value={code} onChangeText={setCode} placeholder="ex: 123456" keyboardType="number-pad" />

      <Button title={loadingVerify ? 'Vérification...' : 'Vérifier OTP'} onPress={verifyOtp} disabled={loadingVerify || !orderId || !code} />
    </View>
  );
}
