import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productsRoutes.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/address.js';
import orderRoutes from './routes/order.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:3000').split(',');

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/order', orderRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Connect to DB, then start server
connectDB()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('DB connection failed:', err.message);
        process.exit(1);
    });
