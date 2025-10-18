import Joi from 'joi';
import { computePrice } from '../services/pricingService.js';
import { inferZoneLevel } from '../utils/geo.js';

const quoteSchema = Joi.object({
  zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  weight: Joi.number().positive().required(),
  type: Joi.string().valid('standard', 'express').required(),
  parcels: Joi.number().integer().min(1).default(1),
}).custom((val, helper) => {
  // Require either lat/lng or zoneLevel
  const hasCoords = typeof val.lat === 'number' && typeof val.lng === 'number';
  if (!hasCoords && !val.zoneLevel) {
    return helper.error('any.custom', { message: 'zoneLevel ou (lat,lng) requis' });
  }
  return val;
});

export const getQuote = async (req, res, next) => {
  try {
    // Prefer POST body; fallback to GET query for backward compatibility
    const input = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
    const { error, value } = quoteSchema.validate(input, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    let { zoneLevel, weight, type, parcels, lat, lng } = value;

    if (weight > 5) {
      const contactPhone = process.env.CONTACT_PHONE || null;
      return res.json({
        zoneLevel,
        weight,
        type,
        parcels,
        requiresManualHandling: true,
        contactPhone,
      });
    }

    // Infer zone from coords if provided
  let inferredZone = null;
  if (typeof lat === 'number' && typeof lng === 'number') {
    inferredZone = await inferZoneLevel(lat, lng);
    if (inferredZone) zoneLevel = inferredZone;
    // If coords were provided but no zone could be inferred and no zoneLevel fallback was given, fail fast with 400
    if (!inferredZone && !zoneLevel) {
      return res.status(400).json({
        msg: "Impossible d’inférer la zone depuis les coordonnées fournies. Vérifiez que l’adresse se situe dans une zone couverte ou fournissez zoneLevel.",
      });
    }
  }

    // Delegate to service for single source of truth
    const { pickupFee, deliveryFee, expressSurcharge, total } = await computePrice({ zoneLevel, type, weight, parcels });

    return res.json({
      zoneLevel,
      inferredZone: inferredZone || undefined,
      weight,
      type,
      parcels,
      fees: { pickupFee, deliveryFee, expressSurcharge },
      priceTotal: total,
      requiresManualHandling: false,
    });
  } catch (err) {
    next(err);
  }
};
