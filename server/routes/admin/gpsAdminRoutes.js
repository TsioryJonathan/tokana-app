import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { listCourierLocations, updateCourierTracking } from '../../controllers/admin/gpsAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/couriers', listCourierLocations);
router.patch('/couriers/:id/tracking', updateCourierTracking);

export default router;
