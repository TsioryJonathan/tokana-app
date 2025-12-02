import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { listCourierDispatches, updateDispatchStatus } from '../controllers/courierDispatchesController.js';

const router = Router();

router.use(protect, authorize('livreur'));

router.get('/', listCourierDispatches);
router.patch('/:id/status', updateDispatchStatus);

export default router;
