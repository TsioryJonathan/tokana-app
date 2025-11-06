import nodemailer from 'nodemailer';

let transporter = null;
let transporterInitialized = false;
let useSendGridAPI = false;
let sgMail = null;

/**
 * Charge et initialise SendGrid API si disponible
 */
async function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return false;
  }
  
  // Charger SendGrid dynamiquement si pas déjà chargé
  if (!sgMail) {
    try {
      const sgModule = await import('@sendgrid/mail');
      sgMail = sgModule.default;
    } catch (e) {
      // SendGrid non installé, on utilisera SMTP
      console.warn('[emailService] @sendgrid/mail non installé, utilisation de SMTP');
      return false;
    }
  }
  
  if (sgMail) {
    sgMail.setApiKey(apiKey);
    useSendGridAPI = true;
    console.log('[emailService] SendGrid API configurée (mode API REST)');
    return true;
  }
  
  return false;
}

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
        connectionTimeout: 30000, // 30 secondes pour Render
        greetingTimeout: 30000,
        socketTimeout: 30000,
        requireTLS: true,
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
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
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
 * Vérifie la configuration email (SendGrid API ou SMTP)
 */
export async function verifyEmailConfig() {
  try {
    // Vérifier SendGrid API d'abord
    if (await initSendGrid()) {
      console.log('[emailService] ✅ SendGrid API configurée (pas de vérification nécessaire)');
      return true;
    }
    
    const t = getTransporter();
    if (!transporterInitialized) {
      console.warn('[emailService] Configuration SMTP non initialisée (mode DEV)');
      return false;
    }
    
    // Timeout de 20 secondes pour la vérification
    await Promise.race([
      t.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de vérification')), 20000)
      )
    ]);
    
    console.log('[emailService] ✅ Configuration SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      console.warn('[emailService] ⚠️ Timeout lors de la vérification SMTP (normal sur Render, les emails fonctionneront quand même)');
      console.warn('[emailService] La connexion sera établie lors du premier envoi d\'email');
    } else {
      console.error('[emailService] ❌ Erreur vérification SMTP:', error.message);
    }
    return false;
  }
}

/**
 * Génère un template HTML professionnel pour les emails OTP
 * @param {string} code - Le code OTP à afficher
 * @param {number} ttlMinutes - Durée de validité en minutes
 * @param {string} type - Type d'OTP ('account' ou 'delivery')
 * @returns {string} HTML de l'email
 */
function generateOtpEmailHtml(code, ttlMinutes = 5, type = 'account') {
  const title = type === 'delivery' ? 'Code de livraison Tokana' : 'Code de vérification Tokana';
  const description = type === 'delivery' 
    ? 'Utilisez ce code pour confirmer la livraison de votre commande.'
    : 'Utilisez ce code pour vérifier votre compte Tokana.';
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Tokana</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">${title}</h2>
              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.5;">${description}</p>
              
              <!-- OTP Code Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${code}</div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                Ce code est valide pendant <strong>${ttlMinutes} minutes</strong>.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                © ${new Date().getFullYear()} Tokana. Tous droits réservés.<br>
                Service de livraison à Madagascar
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envoie un email via SendGrid API ou SMTP
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} text - Corps de l'email (texte)
 * @param {string} html - Corps de l'email (HTML, optionnel)
 * @param {Object} options - Options supplémentaires (replyTo, category, etc.)
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendEmail(to, subject, text, html = null, options = {}) {
  if (!to) {
    throw new Error('Email destination missing');
  }
  
  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Adresse email invalide: ${to}`);
  }

  // Utiliser SendGrid API si disponible
  const sendGridReady = await initSendGrid();
  if (sendGridReady && sgMail) {
    try {
      const fromEmail = process.env.SMTP_FROM || process.env.SENDGRID_FROM || 'noreply@tokana.mg';
      const fromName = process.env.SENDGRID_FROM_NAME || 'Tokana';
      const replyTo = options.replyTo || process.env.SENDGRID_REPLY_TO || fromEmail;
      
      const msg = {
        to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        replyTo: {
          email: replyTo,
          name: fromName,
        },
        subject,
        text,
        // En-têtes pour améliorer la délivrabilité
        headers: {
          'X-Entity-Ref-ID': `tokana-${Date.now()}`,
          'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        // Catégorie pour le tracking SendGrid
        categories: options.category ? [options.category] : ['transactional'],
      };
      
      if (html) {
        msg.html = html;
      }
      
      const [response] = await sgMail.send(msg);
      console.log(`[emailService] ✅ Email envoyé via SendGrid API à ${to} (status: ${response.statusCode})`);
      return { messageId: response.headers['x-message-id'] || `sg-${Date.now()}` };
    } catch (error) {
      console.error(`[emailService] ❌ Erreur SendGrid API pour ${to}:`, error.message);
      if (error.response) {
        console.error(`[emailService] Détails SendGrid:`, JSON.stringify(error.response.body, null, 2));
      }
      throw new Error(`Échec envoi email via SendGrid: ${error.message}`);
    }
  }

  // Fallback sur SMTP
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@tokana.local';
  const replyTo = options.replyTo || from;
  
  const mailOptions = {
    from: `"Tokana" <${from}>`,
    to,
    subject,
    text,
    replyTo: `"Tokana" <${replyTo}>`,
    // En-têtes pour améliorer la délivrabilité
    headers: {
      'X-Entity-Ref-ID': `tokana-${Date.now()}`,
      'List-Unsubscribe': `<mailto:${replyTo}?subject=unsubscribe>`,
    },
  };

  if (html) {
    mailOptions.html = html;
  }

  try {
    // Si le transporter n'est pas initialisé (mode DEV), utiliser le fallback
    if (!transporterInitialized) {
      console.warn(`[emailService] Mode DEV: email simulé pour ${to}`);
      const info = await t.sendMail(mailOptions);
      return info;
    }
    
    // Envoi réel avec retry en cas de timeout
    const info = await Promise.race([
      t.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout lors de l\'envoi')), 30000)
      )
    ]);
    
    console.log(`[emailService] ✅ Email envoyé avec succès à ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`[emailService] ❌ Erreur envoi email à ${to}:`, error.message);
    
    // Si c'est un timeout, essayer une fois de plus après un court délai
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      console.log(`[emailService] Retry après timeout pour ${to}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const info = await t.sendMail(mailOptions);
        console.log(`[emailService] ✅ Email envoyé avec succès (retry) à ${to}`);
        return info;
      } catch (retryError) {
        console.error(`[emailService] ❌ Retry échoué pour ${to}:`, retryError.message);
        throw new Error(`Échec envoi email après retry: ${retryError.message}`);
      }
    }
    
    throw new Error(`Échec envoi email: ${error.message}`);
  }
}

export { generateOtpEmailHtml };
