import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    return transporter;
  }
  // Dev fallback: a fake transporter that logs
  return {
    sendMail: async (opts) => {
      console.log(`[emailService][DEV] to=${opts.to} subject=${opts.subject} text=${opts.text}`);
      return true;
    }
  };
}

export async function sendEmail(to, subject, text) {
  if (!to) throw new Error('Email destination missing');
  const t = getTransporter();
  await t.sendMail({ from: process.env.SMTP_FROM || 'no-reply@tokana.local', to, subject, text });
  return true;
}
