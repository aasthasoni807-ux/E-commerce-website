import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Skip products that were deleted after being added to the cart
        const validItems = cart.items.filter((item) => item.productId);
        if (validItems.length === 0) {
            return res.status(400).json({ message: 'Products in your cart are no longer available' });
        }

        // Check stock before touching anything
        for (const item of validItems) {
            if (item.productId.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for "${item.productId.title}" (available: ${item.productId.stock})`,
                });
            }
        }

        const orderItems = validItems.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
        }));

        const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const order = await Order.create({
            userId,
            items: orderItems,
            address,
            totalAmount,
            paymentMethod: 'COD',
        });

        // Deduct stock only after the order is saved
        for (const item of validItems) {
            await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
        }

        await Cart.findOneAndUpdate({ userId }, { items: [] });

        res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
