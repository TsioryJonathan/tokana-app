import nodemailer from 'nodemailer';

let transporter = null;
let transporterInitialized = false;

function getTransporter() {
  if (transporter) return transporter;
  
  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT.trim(), 10) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  // Nettoyer SMTP_FROM des guillemets s'il y en a
  const fromRaw = process.env.SMTP_FROM?.trim() || user || 'no-reply@tokana.local';
  const from = fromRaw.replace(/^["']|["']$/g, ''); // Enlever les guillemets au début/fin
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
        connectionTimeout: 30000, // 30 secondes (augmenté pour Render/cloud)
        greetingTimeout: 30000, // 30 secondes
        socketTimeout: 30000, // 30 secondes
        requireTLS: true, // Force STARTTLS
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
          requireTLS: true,
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
    // Afficher la configuration (sans le mot de passe)
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const hasPass = !!process.env.SMTP_PASS;
    
    console.log('[emailService] Vérification de la configuration SMTP...');
    console.log(`[emailService] Host: ${host || 'NON DÉFINI'}`);
    console.log(`[emailService] Port: ${port || 'NON DÉFINI'}`);
    console.log(`[emailService] User: ${user || 'NON DÉFINI'}`);
    console.log(`[emailService] Password: ${hasPass ? 'DÉFINI' : 'NON DÉFINI'}`);
    
    if (!host || !user || !hasPass) {
      console.warn('[emailService] Variables SMTP manquantes. Mode DEV activé.');
      return false;
    }
    
    const t = getTransporter();
    if (!transporterInitialized) {
      console.warn('[emailService] Configuration SMTP non initialisée (mode DEV)');
      return false;
    }
    
    console.log('[emailService] Tentative de connexion au serveur SMTP...');
    await t.verify();
    console.log('[emailService] ✅ Configuration SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('[emailService] ❌ Erreur vérification SMTP:', error.message);
    console.error('[emailService] Code erreur:', error.code);
    console.error('[emailService] Stack:', error.stack);
    
    // Messages d'aide selon le type d'erreur
    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
      console.error('[emailService] 💡 Timeout détecté. Vérifiez:');
      console.error('[emailService]   1. Votre connexion internet');
      console.error('[emailService]   2. Que le port 587 n\'est pas bloqué par le pare-feu');
      console.error('[emailService]   3. Essayez le port 465 avec SMTP_SECURE=true');
      console.error('[emailService]   4. Pour Gmail, utilisez un mot de passe d\'application (pas votre mot de passe normal)');
    } else if (error.message.includes('Invalid login') || error.code === 'EAUTH') {
      console.error('[emailService] 💡 Erreur d\'authentification. Vérifiez:');
      console.error('[emailService]   1. Que SMTP_USER et SMTP_PASS sont corrects');
      console.error('[emailService]   2. Pour Gmail, utilisez un mot de passe d\'application');
      console.error('[emailService]   3. Que la validation en deux étapes est activée sur Gmail');
    } else if (error.message.includes('ENOTFOUND') || error.code === 'ENOTFOUND') {
      console.error('[emailService] 💡 Serveur SMTP introuvable. Vérifiez SMTP_HOST');
    }
    
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
  // Nettoyer SMTP_FROM des guillemets s'il y en a
  const fromRaw = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || 'no-reply@tokana.local';
  const from = fromRaw.replace(/^["']|["']$/g, ''); // Enlever les guillemets au début/fin
  
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
