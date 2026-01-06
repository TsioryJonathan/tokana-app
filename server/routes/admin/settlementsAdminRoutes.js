import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  listSettlements,
  getEveningSettlementDetails,
  confirmEveningSettlement
} from '../../controllers/admin/settlementsAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

// Liste de tous les règlements (sans détails des commandes)
router.get('/list', listSettlements);

// Détail d'un règlement avec les commandes (endpoint principal utilisé par le frontend)
router.get('/evening', getEveningSettlementDetails);

// Confirmation d'un règlement
router.post('/evening/:id/confirm', confirmEveningSettlement);
router.post('/evening/confirm', confirmEveningSettlement);

export default router;
