import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { getClientReport, getHistory } from '../../controllers/admin/reportsAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/client', getClientReport);
router.get('/history', getHistory);

export default router;
