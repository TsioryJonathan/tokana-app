import Joi from 'joi';
import { getExpressAvailability, getStandardSlots, isStandardOrderWindow } from '../services/slotService.js';

const slotSchema = Joi.object({
  type: Joi.string().valid('standard', 'express').required(),
  zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').when('type', {
    is: 'standard',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const getSlots = async (req, res, next) => {
  try {
    const { error, value } = slotSchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    const { type, zoneLevel } = value;

    const now = new Date();

    if (type === 'express') {
      const { allowed, etaMin, etaMax } = getExpressAvailability(now);
      return res.json({ type, allowed, eta: { minMinutes: etaMin, maxMinutes: etaMax } });
    }

    // Standard (J-1)
    const allowed = isStandardOrderWindow(now);
    const slots = allowed ? getStandardSlots(zoneLevel, now) : [];
    return res.json({ type, allowed, zoneLevel, slots });
  } catch (err) {
    next(err);
  }
};
