import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAccountStatus, getOrdersSummary } from '../controllers/clientController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification et le rôle client
router.use(protect);

/**
 * GET /api/client/account-status
 * Retourne le statut financier du client
 */
router.get('/account-status', getAccountStatus);

/**
 * GET /api/client/orders/summary
 * Résumé des commandes du client
 */
router.get('/orders/summary', getOrdersSummary);

export default router;
