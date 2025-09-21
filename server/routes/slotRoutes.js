import express from 'express';
import { getSlots } from '../controllers/slotController.js';

const router = express.Router();

router.get('/', getSlots);

// Compatibility routes for client SDK (OpenAPI):
// - GET /api/slots/standard?zoneLevel=...
// - GET /api/slots/express
router.get('/standard', (req, res, next) => {
  // Ensure type is standard; keep zoneLevel from query
  req.query = { ...req.query, type: 'standard' };
  return getSlots(req, res, next);
});

router.get('/express', (req, res, next) => {
  // Ensure type is express; ignore zoneLevel if present
  req.query = { type: 'express' };
  return getSlots(req, res, next);
});

export default router;
