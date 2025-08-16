import Joi from 'joi';
import PricingRule from '../models/PricingRule.js';

const quoteSchema = Joi.object({
  zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').required(),
  weight: Joi.number().positive().required(),
  type: Joi.string().valid('standard', 'express').required(),
  parcels: Joi.number().integer().min(1).default(1),
});

const computePickupFee = (zoneLevel, parcels) => {
  if (zoneLevel === 'ville') return 0;
  if (zoneLevel === 'peripherie') return parcels > 2 ? 0 : 2000;
  if (zoneLevel === 'super-peripherie') return 5000;
  return 0;
};

export const getQuote = async (req, res, next) => {
  try {
    const { error, value } = quoteSchema.validate(req.query, { abortEarly: false, convert: true });
    if (error) return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    const { zoneLevel, weight, type, parcels } = value;

    if (weight > 5) {
      return res.status(400).json({ msg: 'Poids > 5kg non pris en charge pour le moment' });
    }

    // Find matching bracket
    const rules = await PricingRule.findAll({ where: { zoneLevel, type }, order: [['minWeight', 'ASC']] });
    const matched = rules.find(r => weight >= r.minWeight && weight <= r.maxWeight);
    if (!matched) {
      return res.status(400).json({ msg: 'Aucune règle tarifaire pour ce poids/zone/type' });
    }

    const pickupFee = computePickupFee(zoneLevel, parcels);
    const deliveryFee = matched.deliveryFee;
    const expressSurcharge = type === 'express' ? matched.expressSurcharge : 0;
    const priceTotal = pickupFee + deliveryFee + expressSurcharge;

    return res.json({
      zoneLevel,
      weight,
      type,
      parcels,
      fees: { pickupFee, deliveryFee, expressSurcharge },
      priceTotal,
    });
  } catch (err) {
    next(err);
  }
};
