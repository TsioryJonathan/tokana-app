import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { listAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addressesController.js';

const router = express.Router();

router.use(protect);

router.get('/', listAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
