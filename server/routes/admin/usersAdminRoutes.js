import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { createLivreur, listUsers } from '../../controllers/admin/usersAdminController.js';
import { validateCreateLivreur, validateListUsersQuery } from '../../validators/admin/usersAdminValidators.js';

const router = express.Router();

// All admin user routes are protected and admin-only
router.use(protect, authorize('admin'));

// Create a delivery user (livreur)
// POST /api/admin/users
router.post('/', validateCreateLivreur, createLivreur);

// List users with filters/pagination
// GET /api/admin/users?role=client|livreur|admin&q=...&page=1&limit=20
router.get('/', validateListUsersQuery, listUsers);

export default router;
