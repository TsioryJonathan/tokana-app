import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listSavedContacts,
  createSavedContact,
  updateSavedContact,
  deleteSavedContact,
} from '../controllers/savedContactsController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

router.get('/', listSavedContacts);
router.post('/', createSavedContact);
router.patch('/:id', updateSavedContact);
router.delete('/:id', deleteSavedContact);

export default router;
