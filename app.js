import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import serviceRoutes from './routes/service.routes.js';
import offerRoutes from './routes/offer.routes.js';
import errorHandler from './middleware/errorHandler.middleware.js';

dotenv.config();
const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services',serviceRoutes);
app.use('/api/offers', offerRoutes);
app.use(errorHandler);

export default app;
