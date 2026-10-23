import express from 'express';
import protect from '../middleware/auth.js';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// Public
router.get('/', getProducts); // supports ?search= and ?category=
router.get('/:id', getProductById);

// Login required (TODO: add an admin role check)
router.post('/add', protect, createProduct);
router.put('/update/:id', protect, updateProduct);
router.delete('/delete/:id', protect, deleteProduct);

export default router;
