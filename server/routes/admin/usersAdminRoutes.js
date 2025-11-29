import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { createLivreur, createClient, updateUser, deleteUser, listUsers } from '../../controllers/admin/usersAdminController.js';
import { validateCreateLivreur, validateCreateClient, validateUpdateUser, validateListUsersQuery } from '../../validators/admin/usersAdminValidators.js';

const router = express.Router();

// All admin user routes are protected and admin-only
router.use(protect, authorize('admin'));

// Create a delivery user (livreur)
// POST /api/admin/users
router.post('/', validateCreateLivreur, createLivreur);

// Create a client user
// POST /api/admin/users/client
router.post('/client', validateCreateClient, createClient);

// List users with filters/pagination
// GET /api/admin/users?role=client|livreur|admin&q=...&page=1&limit=20
router.get('/', validateListUsersQuery, listUsers);

// Update an existing user (client or livreur)
// PUT /api/admin/users/:id
router.put('/:id', validateUpdateUser, updateUser);

// Delete a user
// DELETE /api/admin/users/:id
router.delete('/:id', deleteUser);

export default router;
