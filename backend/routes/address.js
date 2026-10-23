import express from 'express';
import protect from '../middleware/auth.js';
import { saveAddress, getAddresses } from '../controllers/addressController.js';

const router = express.Router();

router.use(protect);

router.post('/add', saveAddress);
router.get('/:userId', getAddresses);

export default router;
