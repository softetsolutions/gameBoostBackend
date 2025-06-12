import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import serviceRoute from './routes/service.routes.js';
import accountRoute from './routes/account.routes.js'
import socialConnect from './routes/socialConnect.route.js'

dotenv.config();
const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoute);
app.use('/api/account', accountRoute);
app.use('/api/social', socialConnect);

export default app;
