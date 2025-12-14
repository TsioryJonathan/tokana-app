import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail, generateOtpEmailHtml } from "../services/emailService.js";
import crypto from "crypto";
import {
  generateAccessToken,
  createRefreshToken,
  findTokenRecordByRaw,
  rotateRefreshToken,
  revokeToken,
  revokeAllUserTokens,
} from "../services/tokenService.js";
import { normalizeMgPhone } from "../utils/phone.js";

// Accepte: +261XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX (sans 0), 030, 033, 034, 038, 032, 020
const mgPhone = /^(\+261|0)?(30|3[0-9]|20)\d{7}$/;

const registerSchema = Joi.object({
  email: Joi.string().email().messages({ "string.email": "Email invalide" }).optional(),
  phone: Joi.string()
    .pattern(mgPhone)
    .messages({
      "string.pattern.base":
        "Téléphone MG invalide (ex: +261201234567, 0301234567 ou 301234567)",
    })
    .optional(),
  password: Joi.string().min(6).required().messages({ "string.min": "Mot de passe trop court (min 6)" }),
  name: Joi.string().optional(),
}).or('email','phone');

const loginSchema = Joi.alternatives().try(
  Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({ "string.email": "Email invalide" }),
    password: Joi.string()
      .required()
      .messages({ "string.empty": "Mot de passe requis" }),
  }),
  Joi.object({
    phone: Joi.string().pattern(mgPhone).required().messages({
      "string.pattern.base":
        "Téléphone MG invalide (ex: +261201234567, 0301234567 ou 301234567)",
      "string.empty": "Téléphone requis",
    }),
    password: Joi.string()
      .required()
      .messages({ "string.empty": "Mot de passe requis" }),
  })
);

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {

      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    }
    const { email, password, name } = value;
    const phone = value.phone ? normalizeMgPhone(value.phone) : null;

    // Uniqueness: check by email or phone
    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
      if (user) return res.status(400).json({ msg: "Email déjà utilisé" });
    }
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone)
        return res.status(400).json({ msg: "Téléphone déjà utilisé" });
    }

    // Always force default role at registration (client-side role is ignored)
    user = await User.create({
      email: email ?? null,
      password,
      role: "client",
      name,
      phone,
    });

    // Auto-send account OTP after successful registration
    // Only email OTP (no SMS for now)
    let otpInfo = null;
    try {
      if (email) {
    const ttlMin = parseInt(process.env.OTP_TTL_MINUTES || "5", 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const secret = process.env.OTP_SECRET || "";
    const hash = crypto.createHmac("sha256", secret).update(code).digest("hex");

    // Calculer la date d'expiration
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);
    
    user.accountOtpHash = hash;
    user.accountOtpExpiresAt = expiresAt;
    // Reset OTP failure/lock on fresh code
    user.accountOtpFailedAttempts = 0;
    user.accountOtpLockedUntil = null;
    user.accountOtpChannel = "email";
    
    // Sauvegarder AVANT d'envoyer l'email
    await user.save();
    
    // Log de debug
    console.log(`[register][auto-otp] OTP généré:`);
    console.log(`  expiresAt: ${expiresAt.toISOString()}`);
    console.log(`  expiresAt timestamp: ${expiresAt.getTime()}`);
    console.log(`  now timestamp: ${Date.now()}`);
    console.log(`  TTL: ${ttlMin} minutes`);

    const msg = `Tokana code: ${code}. Valide ${ttlMin} min.`;
    const html = generateOtpEmailHtml(code, ttlMin, 'account');
    try {
      await sendEmail(email, "Votre code Tokana", msg, html, { category: 'account-verification' });
      const maskEmail = (e) => (e ? e.replace(/(^.).*(@.*$)/, (_, a, b) => `${a}***${b}`) : null);
      otpInfo = { channel: 'email', to: maskEmail(email), expiresAt: expiresAt.toISOString() };
      console.log(`[register][auto-otp] ✅ OTP envoyé à ${email}`);
    } catch (emailError) {
      console.error(`[register][auto-otp] ❌ Échec envoi email à ${email}:`, emailError.message);
      // L'utilisateur est déjà sauvegardé avec l'OTP, donc il pourra le vérifier même si l'email échoue
      // Don't throw - registration succeeds even if OTP fails
    }
      }
    } catch (e) {
      console.error('[register][auto-otp] Erreur génération OTP:', e?.message || e);
    }

    const token = generateAccessToken({ id: user.id, role: user.role });
    const { raw: refreshToken } = await createRefreshToken(user.id, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
      otp: otpInfo || undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const { email, phone, password } = value;

    let where = {};
    if (email) where.email = email;
    else if (phone) {
      const normalized = normalizeMgPhone(phone);
      where.phone = normalized;
    }

    const user = await User.findOne({ where });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: "Identifiants invalides" });
    }

    const token = generateAccessToken({ id: user.id, role: user.role });
    const { raw: refreshToken } = await createRefreshToken(user.id, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { error, value } = refreshSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    const { refreshToken } = value;

    const record = await findTokenRecordByRaw(refreshToken);
    if (
      !record ||
      record.revokedAt ||
      new Date(record.expiresAt).getTime() <= Date.now()
    ) {
      return res.status(401).json({ msg: "Refresh token invalide" });
    }

    // Anti-replay strict: if reused (already rotated), consider compromise -> revoke all user tokens
    if (record.rotatedAt) {
      await revokeAllUserTokens(record.userId);
      return res.status(401).json({
        msg: "Refresh token réutilisé (compromis): toutes les sessions ont été révoquées",
      });
    }

    // rotate refresh token
    const { raw: newRefresh } = await rotateRefreshToken(record, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    const user = await User.findByPk(record.userId);
    if (!user) return res.status(401).json({ msg: "Utilisateur introuvable" });
    const token = generateAccessToken({ id: user.id, role: user.role });
    return res.json({ token, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { error, value } = logoutSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });
    const { refreshToken } = value;
    const record = await findTokenRecordByRaw(refreshToken);
    if (record && !record.revokedAt) {
      await revokeToken(record);
    }
    return res.json({ msg: "Déconnecté" });
  } catch (err) {
    next(err);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Non authentifié" });
    await revokeAllUserTokens(req.user.id);
    return res.json({ msg: "Toutes les sessions ont été déconnectées" });
  } catch (err) {
    next(err);
  }
};

// --- Account OTP (email verification only) ---
const accountRequestOtpSchema = Joi.object({
  channel: Joi.string().valid("email").required(),
});

const accountVerifyOtpSchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

export const requestAccountOtp = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Non authentifié" });
    const { error, value } = accountRequestOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    const now = Date.now();
    const windowMin = parseInt(process.env.OTP_WINDOW_MINUTES || "10", 10);
    const windowMs = windowMin * 60 * 1000;
    const lastAt = user.accountOtpLastRequestedAt
      ? new Date(user.accountOtpLastRequestedAt).getTime()
      : 0;
    let count = user.accountOtpRequestCount || 0;
    if (!lastAt || now - lastAt > windowMs) {
      count = 0; // reset window
    }
    const steps = (process.env.OTP_COOLDOWN_STEPS || "0,60,120,300")
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 0);
    const idx = Math.min(count, Math.max(steps.length - 1, 0));
    const requiredDelayMs = (steps[idx] ?? 0) * 1000;
    const nextAllowedAt = lastAt + requiredDelayMs;
    if (lastAt && now < nextAllowedAt) {
      const retryAfter = Math.ceil((nextAllowedAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res
        .status(429)
        .json({ msg: "Trop de demandes, réessayez plus tard", retryAfter });
    }

    const ttlMin = parseInt(process.env.OTP_TTL_MINUTES || "5", 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const secret = process.env.OTP_SECRET || "";
    const hash = crypto.createHmac("sha256", secret).update(code).digest("hex");
    
    // Calculer la date d'expiration AVANT de sauvegarder
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);
    
    user.accountOtpHash = hash;
    user.accountOtpExpiresAt = expiresAt;
    user.accountOtpChannel = "email";
    user.accountOtpLastRequestedAt = new Date(now);
    user.accountOtpRequestCount = count + 1;
    
    // Sauvegarder AVANT d'envoyer l'email pour s'assurer que la date est bien enregistrée
    await user.save();
    
    // Log de debug
    console.log(`[requestAccountOtp] OTP généré:`);
    console.log(`  expiresAt: ${expiresAt.toISOString()}`);
    console.log(`  expiresAt timestamp: ${expiresAt.getTime()}`);
    console.log(`  now timestamp: ${Date.now()}`);
    console.log(`  TTL: ${ttlMin} minutes`);

    const msg = `Tokana code: ${code}. Valide ${ttlMin} min.`;
    const html = generateOtpEmailHtml(code, ttlMin, 'account');
    if (!user.email)
      return res.status(400).json({ msg: "Email manquant" });    
    try {
      await sendEmail(user.email, "Votre code Tokana", msg, html, { category: 'account-verification' });
      console.log(`[requestAccountOtp] ✅ OTP envoyé à ${user.email}`);
    } catch (emailError) {
      console.error(`[requestAccountOtp] ❌ Échec envoi email à ${user.email}:`, emailError.message);
      return res.status(500).json({ 
        msg: "Échec envoi email. Vérifiez la configuration SMTP du serveur.",
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    const maskEmail = (e) => (e ? e.replace(/(^.).*(@.*$)/, (_, a, b) => `${a}***${b}`) : null);
    return res.json({
      msg: "OTP envoyé",
      to: maskEmail(user.email),
      channel: "email",
      expiresAt: expiresAt.toISOString(), // Ajouter la date d'expiration pour le frontend
    });
  } catch (err) {
    next(err);
  }
};

export const verifyAccountOtp = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Non authentifié" });
    const { error, value } = accountVerifyOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    if (!user.accountOtpHash || !user.accountOtpExpiresAt) {
      return res.status(400).json({ msg: "Aucun OTP actif" });
    }
    
    // Check lockout window
    const lockedUntil = user.accountOtpLockedUntil ? new Date(user.accountOtpLockedUntil) : null;
    if (lockedUntil && lockedUntil.getTime() > Date.now()) {
      const retryAfter = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ msg: "Trop de tentatives, réessayez plus tard", retryAfter });
    }
    
    // Vérifier l'expiration - s'assurer que la date est correctement convertie
    // Sequelize peut retourner une string ou un Date object selon la configuration
    const expiresAt = user.accountOtpExpiresAt instanceof Date 
      ? user.accountOtpExpiresAt 
      : new Date(user.accountOtpExpiresAt);
    const now = Date.now();
    const expiresAtTime = expiresAt.getTime();
    
    // Log de debug pour diagnostiquer le problème
    console.log(`[verifyAccountOtp] Vérification expiration:`);
    console.log(`  expiresAt (raw): ${user.accountOtpExpiresAt}`);
    console.log(`  expiresAt (parsed): ${expiresAt.toISOString()}`);
    console.log(`  expiresAt (timestamp): ${expiresAtTime}`);
    console.log(`  now (timestamp): ${now}`);
    console.log(`  diff: ${now - expiresAtTime}ms (${(now - expiresAtTime) / 1000}s)`);
    
    // Vérifier avec une marge de 5 secondes pour éviter les problèmes de timing réseau
    if (expiresAtTime <= now) {
      console.log(`[verifyAccountOtp] ❌ OTP expiré: expiresAt=${expiresAt.toISOString()}, now=${new Date(now).toISOString()}, diff=${(now - expiresAtTime) / 1000}s`);
      return res.status(400).json({ msg: "Code expiré, renvoyez un code" });
    }
    
    console.log(`[verifyAccountOtp] ✅ OTP valide: expire dans ${(expiresAtTime - now) / 1000}s`);

    const secret = process.env.OTP_SECRET || "";
    const hash = crypto.createHmac("sha256", secret).update(value.code).digest("hex");
    if (hash !== user.accountOtpHash) {
      // Increment failed attempts and possibly lock
      const maxAttempts = parseInt(process.env.OTP_VERIFY_MAX_ATTEMPTS || "5", 10);
      const lockMinutes = parseInt(process.env.OTP_VERIFY_LOCK_MINUTES || "5", 10);
      const failed = (user.accountOtpFailedAttempts || 0) + 1;
      user.accountOtpFailedAttempts = failed;
      if (failed >= maxAttempts) {
        const lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
        user.accountOtpLockedUntil = lockedUntil;
        await user.save();
        const retryAfter = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({ msg: "Trop de tentatives, réessayez plus tard", retryAfter });
      }
      await user.save();
      // Add a small delay to slow down brute force
      await new Promise((r) => setTimeout(r, 300));
      return res.status(400).json({ msg: "OTP invalide" });
    }

    // Mark email as verified (only email OTP is supported)
    user.emailVerifiedAt = new Date();
    // Success: reset counters and invalidate OTP
    user.accountOtpFailedAttempts = 0;
    user.accountOtpLockedUntil = null;
    user.accountOtpHash = null;
    user.accountOtpExpiresAt = null;
    user.accountOtpChannel = null;
    await user.save();

    return res.json({
      msg: "OTP vérifié",
      emailVerifiedAt: user.emailVerifiedAt,
    });
  } catch (err) {
    next(err);
  }
};
