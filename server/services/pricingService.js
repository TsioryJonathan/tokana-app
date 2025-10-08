import PricingRule from '../models/PricingRule.js';

export async function computePrice({ zoneLevel, type, weight, parcels = 1 }) {
  if (weight > 5) {
    const err = new Error('Poids > 5kg non pris en charge');
    err.status = 400;
    throw err;
  }
  const rules = await PricingRule.findAll({ where: { zoneLevel, type }, order: [['minWeight', 'ASC']] });
  if (!rules || rules.length === 0) {
    const err = new Error('Règles tarifaires introuvables');
    err.status = 400;
    throw err;
  }
  const matched = rules.find(r => weight >= r.minWeight && weight <= r.maxWeight);
  if (!matched) {
    const err = new Error('Aucune règle pour ce poids');
    err.status = 400;
    throw err;
  }
  // Pickup is a per-order fee (not multiplied by number of parcels)
  // Apply zone-specific business rules:
  // - ville: 0 Ar
  // - peripherie: 0 Ar if parcels > 2, else 2 000 Ar
  // - super-peripherie: 5 000 Ar
  let pickupFee = 0;
  if (zoneLevel === 'peripherie') {
    pickupFee = parcels > 2 ? 0 : 2000;
  } else if (zoneLevel === 'super-peripherie') {
    pickupFee = 5000;
  } else {
    pickupFee = 0;
  }

  const deliveryFee = matched.deliveryFee || 0;
  const expressSurcharge = type === 'express' ? (matched.expressSurcharge || 0) : 0;

  // Pricing per order (not per parcel) per business grid/seeders
  const total = pickupFee + deliveryFee + expressSurcharge;
  return { pickupFee, deliveryFee, expressSurcharge, total };
}
