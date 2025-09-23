import express from 'express';
import { listOrders, getOrder, createOrder, updateOrderStatus, assignOrder, listOrderHistory, requestDeliveryOtp, verifyDeliveryOtp, listOrderRemarks, addOrderRemark } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listOrders);
router.get('/:id', protect, getOrder);
router.get('/:id/history', protect, listOrderHistory);
router.get('/:id/remarks', protect, listOrderRemarks);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, authorize('livreur', 'admin'), updateOrderStatus);
router.patch('/:id/assign', protect, authorize('admin'), assignOrder);
router.post('/:id/request-otp', protect, authorize('livreur', 'admin'), requestDeliveryOtp);
router.post('/:id/verify-otp', protect, authorize('livreur', 'admin'), verifyDeliveryOtp);
router.post('/:id/remarks', protect, authorize('livreur', 'admin'), addOrderRemark);

export default router;
