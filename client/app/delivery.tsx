import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { TokanaApiClient, OTPRequest } from './lib/api';
import { getAccessToken } from './lib/auth/session';

export default function DeliveryPage() {
  const api = useMemo(() => new TokanaApiClient({
    TOKEN: async () => (await getAccessToken()) || '',
  }), []);

  const [orderId, setOrderId] = useState('');
  const [channel, setChannel] = useState<OTPRequest.channel>(OTPRequest.channel.SMS);
  const [code, setCode] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const requestOtp = async () => {
    const id = Number(orderId);
    if (!id) return Alert.alert('Erreur', 'Order ID invalide');
    setLoadingReq(true);
    try {
      await api.deliveryOtp.postApiOrdersRequestOtp(id, { channel });
      Alert.alert('OTP', 'Code envoyé');
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || 'Erreur';
      Alert.alert('Erreur', msg);
    } finally {
      setLoadingReq(false);
    }
  };

  const verifyOtp = async () => {
    const id = Number(orderId);
    if (!id) return Alert.alert('Erreur', 'Order ID invalide');
    setLoadingVerify(true);
    try {
      await api.deliveryOtp.postApiOrdersVerifyOtp(id, { code });
      Alert.alert('OTP', 'Livraison confirmée');
    } catch (err: any) {
      const msg: string = err?.body?.msg || err?.message || 'Erreur';
      Alert.alert('Erreur', msg);
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
