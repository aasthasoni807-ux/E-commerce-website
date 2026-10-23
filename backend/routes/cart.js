import express from 'express';
import protect from '../middleware/auth.js';
import { addToCart, removeItem, updateQuantity, getCart } from '../controllers/cartController.js';

const router = express.Router();

router.use(protect);

router.post('/add', addToCart);
router.post('/remove', removeItem);
router.post('/update', updateQuantity);
router.get('/:userId', getCart);

export default router;
