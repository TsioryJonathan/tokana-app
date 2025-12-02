import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getCourierEveningSettlement, declareCourierEveningSettlement } from '../controllers/courierSettlementsController.js';

const router = Router();

router.use(protect, authorize('livreur'));

router.get('/evening', getCourierEveningSettlement);
router.post('/evening/declare', declareCourierEveningSettlement);

export default router;
