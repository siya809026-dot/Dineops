import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './src/config/db.js';

import branchRoutes from './src/routes/branchRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import rawMaterialRoutes from './src/routes/rawMaterialRoutes.js';
import recipeRoutes from './src/routes/recipeRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import saleRoutes from './src/routes/saleRoutes.js';
import stockMovementRoutes from './src/routes/stockMovementRoutes.js';
import purchaseRoutes from './src/routes/purchaseRoutes.js';
import wastageRoutes from './src/routes/wastageRoutes.js';
import stockTransferRoutes from './src/routes/stockTransferRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/wastage', wastageRoutes);
app.use('/api/stock-transfers', stockTransferRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DineOps Backend API is running!'
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`DineOps Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();