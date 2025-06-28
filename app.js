import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
import credentialRoutes from "./routes/credential.routes.js";
import privacyRoutes from './routes/privacy.routes.js'
import accountRoutes from './routes/account.routes.js';
import socialRoutes from './routes/social.routes.js';
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import conversationRouter from "./routes/conversation.route.js";
import setupSocket from "./socket.js";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/credential", credentialRoutes);
app.use("/api/conversations", conversationRouter);
app.use('/api/privacy',privacyRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/social', socialRoutes);
app.use(errorHandler);

setupSocket(io);

export default server;
