import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  listCouriers,
  getCourier,
  createCourier,
  updateCourier,
  deleteCourier,
  toggleCourierGps,
} from '../../controllers/admin/couriersAdminController.js';

const router = express.Router();

// Toutes les routes nécessitent auth admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', listCouriers);
router.get('/:id', getCourier);
router.post('/', createCourier);
router.patch('/:id', updateCourier);
router.delete('/:id', deleteCourier);
router.patch('/:id/gps', toggleCourierGps);

export default router;
