import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { getEveningSettlements, confirmEveningSettlement } from '../../controllers/admin/settlementsAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/evening', getEveningSettlements);
router.post('/evening/confirm', confirmEveningSettlement);

export default router;
