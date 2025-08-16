import express from 'express';
import { getQuote } from '../controllers/pricingController.js';

const router = express.Router();

router.get('/quote', getQuote);

export default router;
