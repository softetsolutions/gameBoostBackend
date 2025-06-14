import express from 'express';
import auth from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { body } from 'express-validator';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();
router.post('/', auth, [
    body('offerId').notEmpty().withMessage('Offer ID is required'),
    body('offerId').isMongoId().withMessage('Invalid Offer ID format')
  ],
  validate, createOrder);
router.get('/', auth, getMyOrders);

export default router;
