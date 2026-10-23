import Cart from '../models/Cart.js';

// The logged-in user always comes from the JWT, never from the request body/params.

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'productId is required' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
        } else {
            const item = cart.items.find((i) => i.productId.toString() === productId);
            if (item) {
                item.quantity += 1;
            } else {
                cart.items.push({ productId, quantity: 1 });
            }
        }

        await cart.save();
        res.json({ message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const removeItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
        await cart.save();

        res.json({ message: 'Item removed from cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a whole number of at least 1' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find((i) => i.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();

        res.json({ message: 'Item quantity updated', cart });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
