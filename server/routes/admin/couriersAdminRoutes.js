const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const {
  listCouriers,
  getCourier,
  createCourier,
  updateCourier,
  deleteCourier,
  toggleCourierGps,
} = require('../../controllers/admin/couriersAdminController');

// Toutes les routes nécessitent auth admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', listCouriers);
router.get('/:id', getCourier);
router.post('/', createCourier);
router.patch('/:id', updateCourier);
router.delete('/:id', deleteCourier);
router.patch('/:id/gps', toggleCourierGps);

module.exports = router;
