import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { 
  listSettlements, 
  getEveningSettlementDetails,
  confirmEveningSettlement 
} from '../../controllers/admin/settlementsAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

// Liste de tous les règlements (optionally filtered by date)
router.get('/evening', listSettlements);

// Détail d'un règlement (liste des commandes associées pour vérification)
router.get('/evening/details', getEveningSettlementDetails);

// Confirmation d'un règlement
router.post('/evening/:id/confirm', confirmEveningSettlement);
router.post('/evening/confirm', confirmEveningSettlement);

export default router;
