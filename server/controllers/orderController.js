import Joi from "joi";
import Order from "../models/Order.js";
import { computePrice } from "../services/pricingService.js";
import OrderStatusHistory from "../models/OrderStatusHistory.js";
import OrderRemark from "../models/OrderRemark.js";
import {
  getStandardSlots,
  isStandardOrderWindow,
  getExpressAvailability,
} from "../services/slotService.js";
import { sendSms } from "../services/smsService.js";
import { sendEmail, generateOtpEmailHtml } from "../services/emailService.js";
import User from "../models/User.js";
import crypto from "crypto";
import { inferZoneLevel } from "../utils/geo.js";

// Accepte: +261XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX (sans 0), 030, 033, 034, 038, 032, 020
const mgPhone = /^(\+261|0)?(30|3[0-9]|20)\d{7}$/;
const createSchema = Joi.object({
  type: Joi.string().valid("standard", "express").required(),
  zoneLevel: Joi.string().valid("ville", "peripherie", "super-peripherie").optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  dropoffLat: Joi.number().optional(),
  dropoffLng: Joi.number().optional(),
  pickupAddress: Joi.string().min(3).required(),
  dropoffAddress: Joi.string().min(3).required(),
  pickupAddressDetail: Joi.string().min(0).max(255).allow('', null).optional(),
  dropoffAddressDetail: Joi.string().min(0).max(255).allow('', null).optional(),
  weight: Joi.number().positive().precision(2).required(),
  parcels: Joi.number().integer().min(1).default(1),
  cashToCollect: Joi.number().integer().min(0).allow(null),
  isPrepaid: Joi.boolean().optional(),
  deliveryFeePrepaid: Joi.boolean().optional(),
  recipientPhone: Joi.string().pattern(mgPhone).optional(),

  recipientEmail: Joi.string().email().optional(),
  // Optional enrichments
  category: Joi.string().valid("ENVELOPE", "SMALL", "MEDIUM", "LARGE", "CUSTOM").optional(),
  customDimensions: Joi.string().max(100).allow('', null).optional(),
  senderRemarks: Joi.string().max(1000).allow('', null).optional(),
  fragile: Joi.boolean().optional(),
  bulky: Joi.boolean().optional(),
  pickupName: Joi.string().min(2).max(120).optional(),
  pickupPhone: Joi.string().pattern(mgPhone).optional(),
  dropoffName: Joi.string().min(2).max(120).optional(),
  notes: Joi.string().min(0).max(1000).allow("").optional(),
  pickupLocalityId: Joi.string().optional(),
  dropoffLocalityId: Joi.string().optional(),
  needReturn: Joi.boolean().optional(),
  // When admin creates an order, it may specify the client (expéditeur)
  createdByClientId: Joi.number().integer().min(1).optional(),
  // For standard only
  slotStart: Joi.date().iso().allow(null),
  slotEnd: Joi.date().iso().allow(null),
}).custom((val, helper) => {
  const hasPrimaryCoords = typeof val.lat === 'number' && typeof val.lng === 'number';
  const hasDropoffCoords = typeof val.dropoffLat === 'number' && typeof val.dropoffLng === 'number';
  if (!hasPrimaryCoords && !hasDropoffCoords && !val.zoneLevel && !val.dropoffLocalityId) {
    return helper.error('any.custom', { message: 'zoneLevel ou (lat,lng) ou (dropoffLat,dropoffLng) ou dropoffLocalityId requis' });
  }
  return val;
});

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "en_cours_de_traitement",
      "en_route_vers_recuperation",
      "en_chemin",
      "en_chemin_pour_livraison",
      "expedie",
      "annule",
      "compte_regle"
    )
    .required(),
});

const requestOtpSchema = Joi.object({
  channel: Joi.string().valid("sms", "email").required(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
});

const verifyOtpSchema = Joi.object({
  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

const assignSchema = Joi.object({
  assignedTo: Joi.number().integer().allow(null).required(),
});

const remarkSchema = Joi.object({
  text: Joi.string().min(2).max(500).required(),
});

const ALLOWED_TRANSITIONS = {
  en_cours_de_traitement: ["en_route_vers_recuperation", "annule"],
  en_route_vers_recuperation: ["en_chemin", "en_chemin_pour_livraison", "annule"],
  en_chemin: ["en_chemin_pour_livraison", "annule"],
  en_chemin_pour_livraison: ["expedie", "annule"],
  expedie: ["compte_regle"],
  annule: [],
  compte_regle: [],
};

export const listOrderRemarks = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // Authorization: admin or livreur can view; clients only if owner
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin" && role !== "livreur") {
      if (!userId || order.createdBy !== userId) {
        return res.status(403).json({ msg: "Accès refusé" });
      }

    // If still no zoneLevel, try to infer from provided coordinates (prefer explicit lat/lng, else dropoffLat/dropoffLng)
    if (!zoneLevel) {
      const effLat = (typeof lat === 'number') ? lat : (typeof dropoffLat === 'number' ? dropoffLat : undefined);
      const effLng = (typeof lng === 'number') ? lng : (typeof dropoffLng === 'number' ? dropoffLng : undefined);
      if (typeof effLat === 'number' && typeof effLng === 'number') {
        try {
          const inferred = await inferZoneLevel(effLat, effLng);
          if (inferred) zoneLevel = inferred;
        } catch {}
      }
    }
    }

    const remarks = await OrderRemark.findAll({
      where: { orderId: id },
      order: [["createdAt", "DESC"]],
    });
    return res.json(remarks);
  } catch (err) {
    next(err);
  }
};

export const addOrderRemark = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const { error, value } = remarkSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // Authorization: only assigned livreur or admin can add remarks
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin") {
      if (role !== "livreur" || order.assignedTo !== userId) {
        return res.status(403).json({ msg: "Non autorisé" });
      }
    }

    const created = await OrderRemark.create({
      orderId: id,
      text: value.text,
      createdBy: userId ?? null,
    });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body, {
      abortEarly: false,
      convert: true,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const {
      type,
      pickupAddress,
      dropoffAddress,
      pickupAddressDetail,
      dropoffAddressDetail,
      weight,
      parcels,
      cashToCollect,
      recipientEmail,
      recipientPhone,
      slotStart,
      slotEnd,
      lat,
      lng,
      dropoffLat,
      dropoffLng,
      createdByClientId,
      isPrepaid,
      deliveryFeePrepaid,
    } = value;

    // Derive zoneLevel from dropoffLocalityId if provided (source of truth)
    let zoneLevel = value.zoneLevel;
    const locId = value.dropoffLocalityId;
    if (locId) {
      // If DB IDs used later, resolve via associations; for now, parse synthetic IDs like 'ville:...'
      const prefix = String(locId).split(":")[0];
      if (
        prefix === "ville" ||
        prefix === "peripherie" ||
        prefix === "super-peripherie"
      ) {
        zoneLevel = prefix;
      }
      // Future: resolve from DB when numeric ID
      // try {
      //   const locality = await Locality.findByPk(Number(locId), { include: { model: Axis, as: 'axis', include: { model: Zone, as: 'zone' } } });
      //   if (locality?.axis?.zone?.key) zoneLevel = locality.axis.zone.key;
      // } catch {}
    }

    // Slots validation
    if (type === "standard") {
      if (!isStandardOrderWindow(new Date()))
        return res
          .status(400)
          .json({ msg: "Créneau de commande standard fermé" });
      if (!slotStart || !slotEnd)
        return res.status(400).json({
          msg: "slotStart et slotEnd requis pour une commande standard",
        });
      const slots = getStandardSlots(zoneLevel);
      const ok = slots.some(
        (s) =>
          s.startISO === new Date(slotStart).toISOString() &&
          s.endISO === new Date(slotEnd).toISOString()
      );
      if (!ok)
        return res.status(400).json({ msg: "Créneau invalide pour la zone" });
    } else {
      const { allowed } = getExpressAvailability(new Date());
      if (!allowed)
        return res
          .status(400)
          .json({ msg: "Commande express non disponible pour le moment" });
    }

    // Pricing
    if (!zoneLevel) {
      return res.status(400).json({ msg: 'zoneLevel introuvable: fournissez zoneLevel ou coordonnées valides' });
    }
    const { total } = await computePrice({ zoneLevel, type, weight, parcels });

    // Determine createdBy: default to current user, but admin may override with a client
    let createdBy = req.user?.id ?? null;
    if (req.user?.role === 'admin' && typeof createdByClientId === 'number') {
      const client = await User.findByPk(createdByClientId);
      if (!client || client.role !== 'client') {
        return res.status(400).json({ msg: 'Client invalide pour createdByClientId' });
      }
      createdBy = client.id;
    }

    const created = await Order.create({
      type,
      zoneLevel,
      pickupAddress,
      dropoffAddress,
      pickupAddressDetail: pickupAddressDetail ?? null,
      dropoffAddressDetail: dropoffAddressDetail ?? null,
      pickupName: value.pickupName ?? null,
      pickupPhone: value.pickupPhone ?? null,
      dropoffName: value.dropoffName ?? null,
      notes: value.notes ?? null,
      senderRemarks: value.senderRemarks ?? null,
      pickupLocalityId: value.pickupLocalityId ?? null,
      dropoffLocalityId: value.dropoffLocalityId ?? null,
      dropoffLat: (typeof lat === 'number') ? lat : ((typeof dropoffLat === 'number') ? dropoffLat : null),
      dropoffLng: (typeof lng === 'number') ? lng : ((typeof dropoffLng === 'number') ? dropoffLng : null),
      weight,
      parcels,
      category: value.category ?? null,
      customDimensions: value.customDimensions ?? null,
      fragile: !!value.fragile,
      bulky: !!value.bulky,
      needReturn: !!value.needReturn,
      cashToCollect: cashToCollect ?? null,
      isPrepaid: !!isPrepaid,
      deliveryFeePrepaid: !!deliveryFeePrepaid,
      priceTotal: total,
      createdBy,
      recipientEmail: recipientEmail ?? null,
      recipientPhone: recipientPhone ?? null,
      slotStart: type === "standard" ? slotStart : null,
      slotEnd: type === "standard" ? slotEnd : null,
    });

    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const requestDeliveryOtp = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const { error, value } = requestOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // Authorization: only assigned livreur or admin
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin") {
      if (role !== "livreur" || order.assignedTo !== userId) {
        return res.status(403).json({ msg: "Non autorisé" });
      }
    }

    // Business guard: only allow OTP when out for delivery
    if (order.status !== "en_chemin_pour_livraison") {
      return res.status(400).json({
        msg: "OTP autorisé uniquement lorsque la commande est en chemin pour livraison",
      });
    }

    // Progressive cooldown (resend smoothing)
    // Window and steps are configurable via env with safe defaults
    const now = Date.now();
    const windowMin = parseInt(process.env.OTP_WINDOW_MINUTES || "10", 10);
    const windowMs = windowMin * 60 * 1000;
    const lastAt = order.deliveryOtpLastRequestedAt
      ? new Date(order.deliveryOtpLastRequestedAt).getTime()
      : 0;
    let count = order.deliveryOtpRequestCount || 0;
    if (!lastAt || now - lastAt > windowMs) {
      count = 0; // reset window
    }
    // Cooldown steps (seconds) after each request within the window
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
        .json({ msg: "Trop de demandes OTP, réessayez plus tard", retryAfter });
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlMin = parseInt(process.env.OTP_TTL_MINUTES || "5", 10);
    const secret = process.env.OTP_SECRET || "";
    const hash = crypto
      .createHash("sha256")
      .update(code + secret)
      .digest("hex");
    
    // Calculer la date d'expiration AVANT de sauvegarder
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);
    
    order.deliveryOtpHash = hash;
    order.deliveryOtpExpiresAt = expiresAt;
    order.deliveryOtpVerifiedAt = null;
    order.deliveryOtpLastRequestedAt = new Date(now);
    order.deliveryOtpRequestCount = count + 1;
    
    // Sauvegarder AVANT d'envoyer l'email pour s'assurer que la date est bien enregistrée
    await order.save();
    
    // Log de debug
    console.log(`[requestDeliveryOtp] OTP généré:`);
    console.log(`  expiresAt: ${expiresAt.toISOString()}`);
    console.log(`  expiresAt timestamp: ${expiresAt.getTime()}`);
    console.log(`  now timestamp: ${Date.now()}`);
    console.log(`  TTL: ${ttlMin} minutes`);

    // Destination
    const channel = value.channel;
    let destPhone = value.phone || order.recipientPhone;
    let destEmail = value.email || order.recipientEmail;
    if (channel === "email" && !destEmail) {
      // fallback to creator email if none on order
      if (order.createdBy) {
        const creator = await User.findByPk(order.createdBy);
        destEmail = creator?.email || null;
      }
    }

    // Validate MG phone if SMS (accepte 030 et numéros sans 0 initial)
    const mgPhoneLocal = /^(\+261|0)?(30|3[0-9]|20)\d{7}$/;
    const msg = `Tokana OTP: ${code}. Valide ${ttlMin} min.`;
    const html = generateOtpEmailHtml(code, ttlMin, 'delivery');
    if (channel === "sms") {
      if (!destPhone)
        return res.status(400).json({ msg: "Numéro destinataire manquant" });
      if (!mgPhoneLocal.test(destPhone))
        return res.status(400).json({
          msg: "Téléphone MG invalide (ex: +261201234567, 0301234567 ou 301234567)",
        });
      await sendSms(destPhone, msg);
    } else {
      if (!destEmail)
        return res.status(400).json({ msg: "Email destinataire manquant" });
      try {
        await sendEmail(destEmail, "Votre code OTP Tokana", msg, html, { category: 'delivery-otp' });
        console.log(`[requestDeliveryOtp] OTP envoyé par email à ${destEmail}`);
      } catch (emailError) {
        console.error(`[requestDeliveryOtp] Échec envoi email à ${destEmail}:`, emailError.message);
        return res.status(500).json({ 
          msg: "Échec envoi email. Vérifiez la configuration SMTP du serveur.",
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    }

    // Mask destination in response
    const maskPhone = (p) =>
      p
        ? p.replace(
            /(\+?\d{2,3})(\d+)(\d{2})$/,
            (_, a, mid, b) => `${a}${"*".repeat(Math.max(0, mid.length))}${b}`
          )
        : null;
    const maskEmail = (e) =>
      e ? e.replace(/(^.).*(@.*$)/, (_, a, b) => `${a}***${b}`) : null;
    return res.json({
      msg: "OTP envoyé",
      to: channel === "sms" ? maskPhone(destPhone) : maskEmail(destEmail),
      channel,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyDeliveryOtp = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const { error, value } = verifyOtpSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // Authorization: only assigned livreur or admin
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin") {
      if (role !== "livreur" || order.assignedTo !== userId) {
        return res.status(403).json({ msg: "Non autorisé" });
      }
    }

    if (!order.deliveryOtpHash || !order.deliveryOtpExpiresAt) {
      return res.status(400).json({ msg: "Aucun OTP actif" });
    }
    
    // Vérifier l'expiration - s'assurer que la date est correctement convertie
    const expiresAt = order.deliveryOtpExpiresAt instanceof Date 
      ? order.deliveryOtpExpiresAt 
      : new Date(order.deliveryOtpExpiresAt);
    const now = Date.now();
    const expiresAtTime = expiresAt.getTime();
    
    // Log de debug
    console.log(`[verifyDeliveryOtp] Vérification expiration:`);
    console.log(`  expiresAt (raw): ${order.deliveryOtpExpiresAt}`);
    console.log(`  expiresAt (parsed): ${expiresAt.toISOString()}`);
    console.log(`  expiresAt (timestamp): ${expiresAtTime}`);
    console.log(`  now (timestamp): ${now}`);
    console.log(`  diff: ${now - expiresAtTime}ms (${(now - expiresAtTime) / 1000}s)`);
    
    if (expiresAtTime <= now) {
      console.log(`[verifyDeliveryOtp] ❌ OTP expiré: expiresAt=${expiresAt.toISOString()}, now=${new Date(now).toISOString()}, diff=${(now - expiresAtTime) / 1000}s`);
      return res.status(400).json({ msg: "Code expiré, renvoyez un code" });
    }
    
    console.log(`[verifyDeliveryOtp] ✅ OTP valide: expire dans ${(expiresAtTime - now) / 1000}s`);

    const secret = process.env.OTP_SECRET || "";
    const hash = crypto
      .createHash("sha256")
      .update(value.code + secret)
      .digest("hex");
    if (hash !== order.deliveryOtpHash) {
      return res.status(400).json({ msg: "OTP invalide" });
    }

    order.deliveryOtpVerifiedAt = new Date();
    // Invalidate OTP after success
    order.deliveryOtpHash = null;
    order.deliveryOtpExpiresAt = null;
    await order.save();

    return res.json({
      msg: "OTP vérifié",
      deliveryOtpVerifiedAt: order.deliveryOtpVerifiedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const listOrderHistory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // Authorization: admin or livreur can view; clients only if owner
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin" && role !== "livreur") {
      if (!userId || order.createdBy !== userId) {
        return res.status(403).json({ msg: "Accès refusé" });
      }
    }

    const history = await OrderStatusHistory.findAll({
      where: { orderId: id },
      order: [["createdAt", "ASC"]],
    });
    return res.json(history);
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });
    // Authorization: admin or livreur can view; clients only if owner
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role !== "admin" && role !== "livreur") {
      if (!userId || order.createdBy !== userId) {
        return res.status(403).json({ msg: "Accès refusé" });
      }
    }
    return res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const { error, value } = statusSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    // If role is livreur, must be assigned to this order
    const role = req.user?.role;
    const userId = req.user?.id;
    if (role === "livreur") {
      if (!userId || order.assignedTo !== userId) {
        return res
          .status(403)
          .json({ msg: "Non autorisé à modifier cette commande" });
      }
    }

    const from = order.status;
    const to = value.status;
    const allowedNext = ALLOWED_TRANSITIONS[from] || [];
    if (!allowedNext.includes(to)) {
      return res
        .status(400)
        .json({ msg: `Transition interdite: ${from} → ${to}` });
    }

    order.status = to;
    await order.save();
    // Record status change history (fire-and-forget if desired)
    try {
      await OrderStatusHistory.create({
        orderId: order.id,
        fromStatus: from,
        toStatus: to,
        changedBy: req.user?.id ?? null,
      });
    } catch (e) {
      // Do not block main flow on history failure
    }
    // Non-blocking customer notification (best-effort)
    (async () => {
      try {
        // Accepte 030 et numéros sans 0 initial
        const mgPhoneNotif = /^(\+261|0)?(30|3[0-9]|20)\d{7}$/;
        const statusLabels = {
          en_cours_de_traitement: "Votre commande est en cours de traitement.",
          en_route_vers_recuperation:
            "Notre livreur est en route pour la récupération.",
          en_chemin: "Votre colis est en chemin.",
          en_chemin_pour_livraison:
            "Votre colis est en route pour la livraison.",
          expedie: "Votre colis a été livré. Merci !",
        };
        const base = `TOKANA – Suivi commande #${order.id}: `;
        const message = base + (statusLabels[to] || `Statut: ${to}`);
        // Prefer SMS if recipientPhone looks valid; else email
        if (order.recipientPhone && mgPhoneNotif.test(order.recipientPhone)) {
          await sendSms(order.recipientPhone, message);
        } else if (order.recipientEmail) {
          await sendEmail(
            order.recipientEmail,
            "Mise à jour de votre commande",
            message
          );
        }
      } catch (e) {
        // Swallow errors to avoid impacting API response
      }
    })();
    return res.json(order);
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const { mine, assignedTo } = req.query;
    const where = {};
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ msg: "Non autorisé" });

    if (role === "admin") {
      if (mine === "true") {
        where.createdBy = userId;
      }
    } else if (role === "livreur") {
      if (assignedTo === "me") {
        where.assignedTo = userId;
      } else {
        where.assignedTo = userId;
      }
    } else {
      where.createdBy = userId;
    }

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    return res.json(orders);
  } catch (err) {
    console.error("Error in listOrders:", err.message);
    console.error("Full error:", err);
    next(err);
  }
};

export const assignOrder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ msg: "ID invalide" });
    const { error, value } = assignSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error)
      return res
        .status(400)
        .json({ msg: error.details.map((e) => e.message).join(", ") });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: "Commande introuvable" });

    order.assignedTo = value.assignedTo; // can be null to unassign
    await order.save();
    return res.json(order);
  } catch (err) {
    next(err);
  }
};
