import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { createLivreur } from '../../controllers/admin/usersAdminController.js';
import { validateCreateLivreur } from '../../validators/admin/usersAdminValidators.js';

const router = express.Router();

// All admin user routes are protected and admin-only
router.use(protect, authorize('admin'));

// Create a delivery user (livreur)
// POST /api/admin/users
router.post('/', validateCreateLivreur, createLivreur);

export default router;
