import { Router } from 'express';
import { getZones } from '../controllers/zonesController.js';

const router = Router();

router.get('/', getZones);

export default router;
