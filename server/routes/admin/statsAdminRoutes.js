import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { getAdminStats } from '../../controllers/admin/statsAdminController.js';

const router = Router();

// Admin-only
router.use(protect, authorize('admin'));

router.get('/', getAdminStats); // GET /api/admin/stats

export default router;
