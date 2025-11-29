import { Router } from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { listPendingClients, createDispatch, listDispatches } from '../../controllers/admin/dispatchesAdminController.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/pending-clients', listPendingClients);
router.post('/', createDispatch);
router.get('/', listDispatches);

export default router;
