import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { postponeOrder, transferOrder } from '../controllers/courierOrderActionsController.js';

const router = Router();

router.use(protect, authorize('livreur'));

router.post('/:id/postpone', postponeOrder);
router.post('/:id/transfer', transferOrder);

export default router;
