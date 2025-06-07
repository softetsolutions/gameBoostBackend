import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();
router.post('/', auth, [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('productId').isMongoId().withMessage('Invalid product ID format')
  ],
  validate, createOrder);
router.get('/', auth, getMyOrders);

export default router;
