import express from 'express';
import { getSlots } from '../controllers/slotController.js';
import Joi from 'joi';
import { getStandardSlots, isStandardOrderWindow } from '../services/slotService.js';

const router = express.Router();

router.get('/', getSlots);

// Compatibility routes for client SDK (OpenAPI):
// - GET /api/slots/standard?zoneLevel=...
// - GET /api/slots/express
router.get('/standard', (req, res, next) => {
  // The client SDK expects an array of Slot items.
  // Validate zoneLevel query and return [] when outside order window.
  try {
    const schema = Joi.object({
      zoneLevel: Joi.string().valid('ville', 'peripherie', 'super-peripherie').required(),
    });
    const { error, value } = schema.validate(req.query, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({ msg: error.details.map(e => e.message).join(', ') });
    }
    const { zoneLevel } = value;
    const allowed = isStandardOrderWindow(new Date());
    const slots = allowed ? getStandardSlots(zoneLevel, new Date()) : [];
    return res.json(slots);
  } catch (err) {
    return next(err);
  }
});

router.get('/express', (req, res, next) => {
  // Ensure type is express; ignore zoneLevel if present
  const reqWithType = { ...req, query: { type: 'express' } };
  return getSlots(reqWithType, res, next);
});

export default router;
