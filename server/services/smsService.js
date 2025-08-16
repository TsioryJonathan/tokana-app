import fetch from 'node-fetch';

const provider = process.env.SMS_PROVIDER || 'dev';

async function sendViaBefiana(to, message) {
  const apiUrl = process.env.SMS_BEFIANA_API_URL; // e.g., https://api.befiana.cloud/sms/send (placeholder)
  const apiKey = process.env.SMS_BEFIANA_API_KEY;
  const sender = process.env.SMS_SENDER_ID || 'TOKANA';
  if (!apiUrl || !apiKey) {
    console.warn('[smsService] Befiana credentials missing, falling back to dev log');
    return sendViaDev(to, message);
  }
  const payload = { to, message, sender };
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[smsService] Befiana error ${res.status}: ${text}`);
  }
  return true;
}

async function sendViaDev(to, message) {
  // Dev fallback: just log
  console.log(`[smsService][DEV] SMS to=${to} message=${message}`);
  return true;
}

export async function sendSms(to, message) {
  if (!to) throw new Error('SMS destination missing');
  if (provider === 'befiana') return sendViaBefiana(to, message);
  return sendViaDev(to, message);
}
