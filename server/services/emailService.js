import nodemailer from 'nodemailer';

let transporter = null;
let transporterInitialized = false;

function getTransporter() {
  if (transporter) return transporter;
  
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'no-reply@tokana.local';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  
  // Support for Gmail
  const isGmail = host && (host.includes('gmail.com') || host === 'smtp.gmail.com');
  
  if (host && user && pass) {
    try {
      // Log de debug (sans afficher le mot de passe)
      console.log(`[emailService] Configuration SMTP détectée:`);
      console.log(`[emailService]   Host: ${host}`);
      console.log(`[emailService]   Port: ${port}`);
      console.log(`[emailService]   User: ${user}`);
      console.log(`[emailService]   Secure: ${secure}`);
      console.log(`[emailService]   Password length: ${pass.length} caractères`);
      
      const config = {
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
        },
      };

      // Gmail-specific configuration
      if (isGmail) {
        // Use Gmail service configuration (simpler and more reliable)
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user,
            pass,
          },
        });
        transporterInitialized = true;
        console.log(`[emailService] SMTP configuré: Gmail`);
        return transporter;
      }

      transporter = nodemailer.createTransport(config);
      transporterInitialized = true;
      
      console.log(`[emailService] SMTP configuré: ${host}:${port}`);
      return transporter;
    } catch (error) {
      console.error('[emailService] Erreur création transporter:', error.message);
      throw error;
    }
  }
  
  // Dev fallback: a fake transporter that logs
  console.warn('[emailService] Variables SMTP manquantes (SMTP_HOST, SMTP_USER, SMTP_PASS). Mode DEV: emails seront loggés uniquement.');
  return {
    sendMail: async (opts) => {
      console.log(`[emailService][DEV] Email simulé:`);
      console.log(`  To: ${opts.to}`);
      console.log(`  From: ${opts.from}`);
      console.log(`  Subject: ${opts.subject}`);
      console.log(`  Text: ${opts.text}`);
      return { messageId: 'dev-' + Date.now() };
    },
    verify: async () => {
      console.log('[emailService][DEV] Vérification SMTP simulée (mode DEV)');
      return true;
    }
  };
}

/**
 * Vérifie la configuration SMTP
 */
export async function verifyEmailConfig() {
  try {
    const t = getTransporter();
    if (!transporterInitialized) {
      console.warn('[emailService] Configuration SMTP non initialisée (mode DEV)');
      return false;
    }
    await t.verify();
    console.log('[emailService] Configuration SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('[emailService] Erreur vérification SMTP:', error.message);
    return false;
  }
}

/**
 * Envoie un email
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} text - Corps de l'email (texte)
 * @param {string} html - Corps de l'email (HTML, optionnel)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendEmail(to, subject, text, html = null) {
  if (!to) {
    throw new Error('Email destination missing');
  }
  
  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Adresse email invalide: ${to}`);
  }

  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@tokana.local';
  
  const mailOptions = {
    from: `"Tokana" <${from}>`,
    to,
    subject,
    text,
  };

  if (html) {
    mailOptions.html = html;
  }

  try {
    const info = await t.sendMail(mailOptions);
    
    if (transporterInitialized) {
      console.log(`[emailService] Email envoyé avec succès à ${to} (messageId: ${info.messageId})`);
    }
    
    return info;
  } catch (error) {
    console.error(`[emailService] Erreur envoi email à ${to}:`, error.message);
    throw new Error(`Échec envoi email: ${error.message}`);
  }
}
