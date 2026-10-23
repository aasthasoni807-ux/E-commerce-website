import express from 'express';
import protect from '../middleware/auth.js';
import { placeOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', protect, placeOrder);

export default router;
