import Product from "../models/Product.js";

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, image, stock } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ message: 'Title and price are required' });
        }

        const product = await Product.create({ title, description, price, category, image, stock });
        res.status(201).json({
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all products (with optional search and category filter)
export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        let filter = {};

        if (search) {
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
            filter.title = { $regex: safe, $options: 'i' };
        }

        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { title, description, price, category, image, stock } = req.body;
        const fields = { title, description, price, category, image, stock };
        Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k]);
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            fields,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({
            message: 'Product updated successfully',
            updated,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};