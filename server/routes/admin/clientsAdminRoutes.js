import express from 'express';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../../controllers/admin/clientsAdminController.js';

const router = express.Router();

// Toutes les routes nécessitent auth admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
