import Joi from 'joi';
import { computePrice } from '../services/pricingService.js';

const quoteSchema = Joi.object({
  zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').required(),
  weight: Joi.number().positive().required(),
  type: Joi.string().valid('standard', 'express').required(),
  parcels: Joi.number().integer().min(1).default(1),
});

export const getQuote = async (req, res, next) => {
  try {
    // Prefer POST body; fallback to GET query for backward compatibility
    const input = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
    const { error, value } = quoteSchema.validate(input, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    const { zoneLevel, weight, type, parcels } = value;

    if (weight > 5) {
      const contactPhone = process.env.CONTACT_PHONE || null;
      return res.json({
        zoneLevel,
        weight,
        type,
        parcels,
        requiresManualHandling: true,
        instructions: 'Poids supérieur à 5kg. Veuillez contacter le responsable par appel téléphonique ou SMS pour un devis personnalisé.',
        contactPhone,
      });
    }

    // Delegate to service for single source of truth
    const { pickupFee, deliveryFee, expressSurcharge, total } = await computePrice({ zoneLevel, type, weight, parcels });

    return res.json({
      zoneLevel,
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
