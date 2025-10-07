import Joi from 'joi';
import { getExpressAvailability, getStandardSlots, isStandardOrderWindow } from '../services/slotService.js';
import { inferZoneLevel } from '../utils/geo.js';

const slotSchema = Joi.object({
  type: Joi.string().valid('standard', 'express').required(),
  zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
}).custom((val, helper) => {
  if (val.type === 'standard') {
    const hasCoords = typeof val.lat === 'number' && typeof val.lng === 'number';
    if (!hasCoords && !val.zoneLevel) {
      return helper.error('any.custom', { message: 'zoneLevel ou (lat,lng) requis pour type=standard' });
    }
  }
  return val;
});

export const getSlots = async (req, res, next) => {
  try {
    const { error, value } = slotSchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    let { type, zoneLevel, lat, lng } = value;

    const now = new Date();

    if (type === 'express') {
      const { allowed, etaMin, etaMax } = getExpressAvailability(now);
      return res.json({ type, allowed, eta: { minMinutes: etaMin, maxMinutes: etaMax } });
    }

    // Standard (J-1)
    const allowed = isStandardOrderWindow(now);
    let inferredZone = null;
    if (typeof lat === 'number' && typeof lng === 'number') {
      inferredZone = await inferZoneLevel(lat, lng);
      if (inferredZone) zoneLevel = inferredZone;
    }
    const slots = allowed ? getStandardSlots(zoneLevel, now) : [];
    return res.json({ type, allowed, zoneLevel, inferredZone: inferredZone || undefined, slots });
  } catch (err) {
    next(err);
  }
};
